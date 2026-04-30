import os
import dataclasses
import logging
import platform
import sys
import time
import threading
import uuid
import numpy as np
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import jwt

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("palash-ai")

# Suppress LiveKit telemetry exporter quota noise — harmless 429s, not our code
logging.getLogger("opentelemetry.exporter.otlp.proto.http._log_exporter").setLevel(logging.CRITICAL)
logging.getLogger("opentelemetry.exporter.otlp.proto.http.metric_exporter").setLevel(logging.CRITICAL)
logging.getLogger("charset_normalizer").setLevel(logging.WARNING)

# Force override to ensure new keys are used
load_dotenv(override=True)


class KeyRotator:
    """Round-robin API key rotation. Reads PREFIX_1, PREFIX_2, ... from env."""

    def __init__(self, prefix: str, fallback: str):
        self._keys = self._load(prefix, fallback)
        self._idx = 0
        self._lock = threading.Lock()
        logger.info(f"KeyRotator({prefix}): {len(self._keys)} key(s) loaded")

    def _load(self, prefix: str, fallback: str) -> list:
        keys = []
        i = 1
        while True:
            key = os.getenv(f"{prefix}_{i}")
            if not key:
                break
            keys.append(key)
            i += 1
        if not keys:
            single = os.getenv(fallback)
            if single:
                keys.append(single)
        if not keys:
            raise RuntimeError(f"No API keys found for prefix {prefix} or fallback {fallback}")
        return keys

    def next(self) -> str:
        with self._lock:
            key = self._keys[self._idx % len(self._keys)]
            logger.debug(f"Assigned key index {self._idx % len(self._keys)} (total assigned: {self._idx + 1})")
            self._idx += 1
            return key


deepgram_rotator = KeyRotator("DEEPGRAM_API_KEY", "DEEPGRAM_API_KEY")
groq_rotator = KeyRotator("GROQ_API_KEY", "GROQ_API_KEY")


class _GainStream:
    """Wraps a TTS SynthesizeStream and applies linear gain to every audio frame."""

    def __init__(self, inner, gain: float):
        self._inner = inner
        self._gain = np.float32(gain)

    # Dunder methods are looked up on the class, not the instance,
    # so __getattr__ delegation never catches them — define explicitly.
    async def __aenter__(self):
        if hasattr(type(self._inner), "__aenter__"):
            await self._inner.__aenter__()
        return self

    async def __aexit__(self, *args):
        if hasattr(type(self._inner), "__aexit__"):
            await self._inner.__aexit__(*args)
        else:
            await self.aclose()

    def push_text(self, text):
        self._inner.push_text(text)

    def end_input(self):
        self._inner.end_input()

    def flush(self):
        if hasattr(self._inner, "flush"):
            self._inner.flush()

    async def aclose(self):
        await self._inner.aclose()

    def __getattr__(self, name):
        return getattr(self._inner, name)

    async def __aiter__(self):
        from livekit import rtc
        async for event in self._inner:
            if hasattr(event, "frame") and event.frame is not None:
                frame = event.frame
                # Must convert to float32 first — multiplying int16 * float32 gives float32,
                # and np.clip refuses to cast float32 back into an int16 out buffer.
                samples_f = np.frombuffer(frame.data, dtype=np.int16).astype(np.float32)
                amplified = np.clip(samples_f * self._gain, -32768, 32767).astype(np.int16)
                new_frame = rtc.AudioFrame(
                    data=amplified.tobytes(),
                    sample_rate=frame.sample_rate,
                    num_channels=frame.num_channels,
                    samples_per_channel=frame.samples_per_channel,
                )
                yield dataclasses.replace(event, frame=new_frame)
            else:
                yield event


class GainTTS:
    """Proxy around any TTS plugin that boosts output volume without clipping."""

    def __init__(self, inner_tts, gain: float = 2.0):
        self._inner = inner_tts
        self._gain = gain

    def stream(self, **kwargs):
        return _GainStream(self._inner.stream(**kwargs), self._gain)

    def __getattr__(self, name):
        return getattr(self._inner, name)

app = FastAPI(title="Palash AI Portfolio Backend")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Modern LiveKit Agent (v1.5.6 Optimized) ---

def patch_windows_platform_probe() -> None:
    if os.name == "nt":
        platform.system = lambda: "Windows"


IS_LIVEKIT_WORKER = any(arg in {"dev", "start", "console", "connect"} for arg in sys.argv[1:])
if IS_LIVEKIT_WORKER:
    patch_windows_platform_probe()
    from livekit.plugins import deepgram, groq, silero


KNOWLEDGE_BASE = """
Palash Joshi is an AI Engineer and Backend Systems Architect based in Indore, India. His positioning: building scalable AI and backend systems from concept to production.

Experience:
- Founder and AI Engineer at QuantCortex.in, Mar 2026-present. Built a production AI financial research platform for Indian retail investors and reached 100+ users within 6 weeks.
- AI Engineer contractor at NXL, Dec 2025-Feb 2026. Built an AI-powered SDR automation system for a UK client and improved outbound response rates from 4-5% to 13%.
- Software Engineer at GrowwStacks, Feb 2025-Dec 2025. Delivered 80+ automation and cloud infrastructure projects, reducing manual processing time by 60-80%. Awarded Employee of the Month twice.
- Software Engineer at Secret Weapon Trading Solutions, Mar 2024-Feb 2025. Built 100+ Python and Pine Script trading strategies and analytics pipelines tracking 15+ performance metrics.

Key projects:
- QuantCortex: AI research platform for BSE-listed equities using FastAPI, Next.js, FinBERT, ChromaDB, BM25/RRF, SQLite, Groq LLaMA, Nginx, and Vercel. It uses hybrid retrieval, 3-layer OCR ingestion, and Bull/Bear/Macro multi-agent event forecasting to reduce research time by about 70%.
- Role-Based RAG with MCP: Unified RAG platform over 10+ internal systems using hybrid vector and SQL retrieval, Pinecone, PostgreSQL, Azure OpenAI, RBAC, Docker, Terraform, and CI/CD on Azure VMs.

Core expertise:
- AI systems: RAG, vector search, SQL retrieval, Pinecone, ChromaDB, Azure OpenAI, MCP query orchestration, multi-agent systems, prompt engineering, intelligent document processing, LoRA/PEFT.
- Backend: Python, FastAPI, REST APIs, GraphQL APIs, PostgreSQL, microservices.
- Cloud and DevOps: Azure, Google Cloud Platform, Docker, Terraform, CI/CD, VMs, Nginx, Vercel, production infrastructure.
- Automation and integrations: n8n, Make, Power Automate, OAuth2-secured API integrations, CRM integrations, Microsoft Graph, retries, rate limits, failure recovery.
- Frontend and automation: React, Next.js, JavaScript, Selenium.

Education:
- Bachelor of Computer Applications in Data Science from Sage University, Indore, 2022-2025. Studied ML, neural networks, EDA, and DBMS.

Differentiator:
Palash focuses on production systems, not demos. He is strongest when he owns architecture, APIs, integrations, automation, deployment, and reliability end to end.
""".strip()


def assistant_instructions() -> str:
    return f"""
You are the AI assistant on Palash Joshi's portfolio, speaking with recruiters, hiring managers, or technical visitors.

Rules:
- Answer in 1-2 spoken sentences. Never monologue.
- Be warm and direct. Let the visitor lead.
- Speak about Palash in third person. Never pretend to be him.
- For broad questions give one key fact then ask what to unpack.
- For role-fit questions give a 2-sentence match with one concrete metric.
- If unsure, say you don't have that detail.
- Answer directly — no "according to the resume" phrases.

Knowledge base:
{KNOWLEDGE_BASE}
""".strip()


def build_portfolio_assistant():
    patch_windows_platform_probe()
    from livekit.agents import Agent

    class PortfolioAssistant(Agent):
        def __init__(self):
            super().__init__(
                instructions=assistant_instructions()
            )

        async def on_enter(self):
            logger.info("Assistant joined the room.")
            await self.session.say(
                "Hi, I'm Palash's AI assistant. What would you like to know about him?"
            )

    return PortfolioAssistant


async def entrypoint(ctx):
    patch_windows_platform_probe()
    from livekit.agents import AgentSession, TurnHandlingOptions

    logger.info(f"Incoming job request for room: {ctx.room.name}")
    await ctx.connect()
    
    dg_key = deepgram_rotator.next()
    groq_key = groq_rotator.next()

    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language="en-US", api_key=dg_key),
        llm=groq.LLM(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            temperature=0.25,
            max_completion_tokens=120,
            api_key=groq_key,
        ),
        tts=GainTTS(deepgram.TTS(model="aura-2-arcas-en", api_key=dg_key), gain=2.0),
        vad=ctx.proc.userdata["vad"],
        turn_handling=TurnHandlingOptions(turn_detection="vad"),
    )

    await session.start(room=ctx.room, agent=build_portfolio_assistant()())
    logger.info("Agent Session ACTIVE.")


def prewarm_process(proc):
    global deepgram, groq, silero

    patch_windows_platform_probe()
    from livekit.plugins import deepgram, groq, silero
    proc.userdata["vad"] = silero.VAD.load()


def session_load(worker) -> float:
    """Allow up to 2 concurrent sessions. Returns 0.5 per active job, capped at 1.0."""
    return min(len(worker.active_jobs) / 2, 1.0)

@app.get("/token")
async def get_token(room: str, name: str = "Recruiter"):
    url = os.getenv("LIVEKIT_URL")
    key = os.getenv("LIVEKIT_API_KEY")
    secret = os.getenv("LIVEKIT_API_SECRET")
    
    if not url or not key or not secret:
        raise HTTPException(status_code=500, detail="LiveKit credentials missing")
        
    now = int(time.time())
    payload = {
        "iss": key,
        "sub": name,
        "name": name,
        "nbf": now,
        "exp": now + 60 * 10,
        "jti": str(uuid.uuid4()),
        "video": {
            "roomJoin": True,
            "room": room,
            "canPublish": True,
            "canSubscribe": True,
            "canPublishData": True,
        },
    }
    token = jwt.encode(payload, secret, algorithm="HS256")
    return {"token": token, "url": url}

if __name__ == "__main__":
    patch_windows_platform_probe()
    from livekit.agents import WorkerOptions, cli

    # Use call count instead of host CPU so a busy dev machine does not reject calls.
    cli.run_app(WorkerOptions(
        entrypoint_fnc=entrypoint,
        prewarm_fnc=prewarm_process,
        load_fnc=session_load,
        load_threshold=1.0,
        num_idle_processes=1,
    ))

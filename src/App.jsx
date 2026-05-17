import React, { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LucideArrowRight, LucideCheckCircle2, LucideCpu, LucideDatabase, LucideGitBranch, LucideNetwork, LucideZap, Github, Linkedin, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { LiveKitRoom, RoomAudioRenderer, useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { SiPython, SiFastapi, SiNextdotjs, SiPytorch, SiHuggingface, SiDocker, SiTerraform, SiGooglecloud, SiNginx, SiRedis, SiN8N, SiMake, SiSelenium, SiSqlite, SiTradingview, SiReact, SiMeta } from 'react-icons/si';

gsap.registerPlugin(ScrollTrigger);

// --- Utilities ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "w-full px-6 lg:px-12 h-20 lg:h-24 sticky top-0 z-[999] backdrop-blur-md flex justify-between items-center font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-charcoal transition-all duration-300",
        scrolled ? "bg-white" : "bg-white/50"
      )}
      style={{
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        boxShadow: scrolled ? '0 1px 12px rgba(0,0,0,0.06)' : 'none'
      }}
    >
      {/* LEFT: Logo — aligned to left column */}
      <div className="w-1/2 lg:w-1/3 flex flex-col">
        <span className="text-2xl lg:text-3xl tracking-tighter lowercase normal-case" style={{ fontFamily: '"Inter", sans-serif', fontWeight: 800 }}>Palash.</span>
        <span className="text-xs lg:text-sm text-charcoal/60 font-semibold normal-case tracking-normal uppercase" style={{ fontFamily: '"Inter", sans-serif' }}>AI Engineer</span>
      </div>

      {/* CENTER: Social links — aligned to center column */}
      <div className="hidden lg:flex lg:w-1/3 justify-center gap-6 items-center">
        <a href="https://github.com/Palash-Devo7" target="_blank" rel="noopener noreferrer" className="hover:text-accentTan transition-colors"><Github size={18} /></a>
        <a href="https://www.linkedin.com/in/palash-joshi-901656286/" target="_blank" rel="noopener noreferrer" className="hover:text-accentTan transition-colors"><Linkedin size={18} /></a>
      </div>

      {/* RIGHT: Nav links — aligned to right column */}
      <div className="hidden lg:flex w-1/3 justify-end gap-10 items-center">
        <a href="#projects" className="hover:opacity-40 transition-opacity">latest work</a>

        <a href="https://calendly.com/palash-quantcortex/30min" target="_blank" rel="noopener noreferrer" className="bg-charcoal text-white px-5 py-2.5 rounded-full hover:bg-charcoal/90 transition-all hover:scale-105">schedule call</a>
      </div>
    </nav>
  );
};

function AgentTranscript({ transcriptRef }) {
  const room = useRoomContext();
  const [committed, setCommitted] = useState([]); // final segments — fade to history
  const [live, setLive] = useState('');            // non-final segments — updates word-by-word

  useEffect(() => {
    const handleTranscription = (segments, participant) => {
      let finalText = '';
      let liveText = '';

      for (const seg of segments) {
        if (seg.final && seg.text?.trim()) {
          finalText += (finalText ? ' ' : '') + seg.text.trim();
        } else if (!seg.final && seg.text?.trim()) {
          liveText += (liveText ? ' ' : '') + seg.text.trim();
        }
      }

      // Capture ALL final turns (user + agent) for session memory
      if (finalText && transcriptRef) {
        const speaker = participant?.isLocal ? 'user' : 'assistant';
        transcriptRef.current = [...transcriptRef.current, { speaker, text: finalText }];
      }

      // Visual display: agent speech only
      if (participant?.isLocal) return;

      if (finalText) {
        setCommitted(prev => [...prev.slice(-1), finalText]);
        setLive('');
      }
      if (liveText) {
        setLive(liveText);
      }
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => room.off(RoomEvent.TranscriptionReceived, handleTranscription);
  }, [room]);

  const hasContent = committed.length > 0 || live;

  if (!hasContent) {
    return (
      <div className="text-center space-y-1">
        <p className="text-[10px] font-black tracking-[0.2em] uppercase text-accentTan">Assistant Listening</p>
        <p className="text-[11px] font-medium text-white/40 italic leading-snug">"Ask about research or work"</p>
      </div>
    );
  }

  return (
    <div className="w-full text-center space-y-1">
      {committed.map((line, i) => (
        <p key={i} className="text-[10px] leading-relaxed italic text-white/30 transition-all duration-500">
          "{line}"
        </p>
      ))}
      {live && (
        <p className="text-[10px] leading-relaxed italic text-white/80 font-medium transition-all duration-100">
          "{live}"
        </p>
      )}
    </div>
  );
}

function AudioUnlocker() {
  const room = useRoomContext();
  useEffect(() => { room.startAudio(); }, [room]);
  return null;
}

function SessionPanel({ sessionId, transcriptRef, historySavedRef }) {
  const room = useRoomContext();
  const [timeLeft, setTimeLeft] = useState(8 * 60);
  const saveAndEndRef = useRef(null);

  const saveAndEnd = useCallback(async () => {
    if (!historySavedRef.current && transcriptRef.current.length > 0) {
      historySavedRef.current = true;
      try {
        await fetch(`https://portfolio-api.quantcortex.in/history/${sessionId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ turns: transcriptRef.current }),
        });
      } catch (e) {
        console.error('Failed to save history:', e);
      }
    }
    await room.disconnect();
  }, [room, sessionId, transcriptRef, historySavedRef]);

  // Always keep the ref pointing to the latest saveAndEnd
  useEffect(() => { saveAndEndRef.current = saveAndEnd; });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          saveAndEndRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[9px] font-black tracking-[0.2em] uppercase">
        <span className="text-white/40">Session</span>
        <span className={timeLeft < 60 ? 'text-red-400' : 'text-white/40'}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
      <button
        onClick={saveAndEnd}
        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
      >
        Terminate Session
      </button>
    </div>
  );
}

const Hero = () => {
  const containerRef = useRef(null);
  const [token, setToken] = useState("");
  const [connectionUrl, setConnectionUrl] = useState("");
  const [agentStatus, setAgentStatus] = useState("idle"); // idle, connecting, success, error, ended

  const [sessionId] = useState(() => {
    let sid = localStorage.getItem('portfolio_session_id');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('portfolio_session_id', sid);
    }
    return sid;
  });
  const [hasHistory, setHasHistory] = useState(false);
  const transcriptRef = useRef([]);
  const historySavedRef = useRef(false);

  // Check for existing saved history on mount
  useEffect(() => {
    fetch(`https://portfolio-api.quantcortex.in/history/${sessionId}`)
      .then(r => r.json())
      .then(data => setHasHistory(data.has_history))
      .catch(() => {});
  }, [sessionId]);

  // sendBeacon on tab close — browser-guaranteed delivery
  useEffect(() => {
    const handleUnload = () => {
      if (!historySavedRef.current && transcriptRef.current.length > 0) {
        navigator.sendBeacon(
          `https://portfolio-api.quantcortex.in/history/${sessionId}`,
          new Blob([JSON.stringify({ turns: transcriptRef.current })], { type: 'application/json' })
        );
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [sessionId]);

  const handleSummon = async () => {
    setAgentStatus("connecting");
    transcriptRef.current = [];
    historySavedRef.current = false;

    try {
      const roomName = `portfolio-call-${Date.now()}--${sessionId}`;
      const response = await fetch(
        `https://portfolio-api.quantcortex.in/token?room=${roomName}&name=Recruiter`
      );

      if (!response.ok) throw new Error("Failed to fetch token");

      const data = await response.json();
      setToken(data.token);
      setConnectionUrl(data.url);
      setAgentStatus("success");

    } catch (error) {
      console.error("Connection error:", error);
      setAgentStatus("error");
      setTimeout(() => setAgentStatus("idle"), 3000);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-reveal", {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="min-h-screen bg-white flex flex-col font-sans text-charcoal overflow-x-hidden"
    >
      {/* Navbar spans full width across all 3 columns */}
      <Navbar />

      {/* 3-Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row pb-0">

        {/* ── LEFT COLUMN (33%) — Pale Yellow, outlined name Z-pattern ── */}
        <div className="w-full lg:w-1/3 min-h-[40vh] bg-[#FFF4C2] hidden lg:flex flex-col justify-center px-6 lg:px-8 relative overflow-hidden order-3 lg:order-1 border-t lg:border-t-0 border-charcoal/10">
          <h1
            className="hero-reveal font-sans font-black select-none text-transparent w-full flex flex-col justify-center"
            style={{
              fontSize: 'clamp(4rem, 10vw, 12rem)',
              WebkitTextStroke: '2px #C4916A',
              letterSpacing: '-0.03em',
              lineHeight: 0.9,
            }}
          >
            <div style={{ textAlign: 'left' }} className="w-full block">PAL</div>
            <div style={{ textAlign: 'right' }} className="w-full block">ASH</div>
          </h1>
        </div>

        {/* ── CENTER COLUMN (33%) — Warm Tan, portrait photo ── */}
        <div className="w-full lg:w-1/3 py-10 lg:py-8 bg-[#EBCFB2] relative overflow-hidden flex flex-col items-center justify-center order-1 lg:order-2 border-x border-charcoal/5">
          <div className="relative group">
            {/* Decorative ring */}
            <div className="absolute inset-x-[-12px] inset-y-[-12px] border-2 border-charcoal/10 rounded-full animate-[spin_15s_linear_infinite] pointer-events-none"></div>
            <img
              src="palash Profile pic sample 1.jpeg"
              alt="Portrait of Palash Joshi"
              className="w-[200px] lg:w-[300px] aspect-square object-cover object-center shadow-2xl rounded-full relative z-10 border-4 border-white"
            />
          </div>

          {/* --- Voice Agent Launcher (Simple Recruiter Version) --- */}
          <div className="mt-6 w-full max-w-[260px] bg-white/60 backdrop-blur-3xl border border-charcoal/10 rounded-[2rem] p-5 shadow-2xl relative z-20 overflow-hidden">
            <div className="flex flex-col gap-1 mb-4 px-1 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accentTan animate-pulse"></div>
                <span className="text-[10px] font-black text-charcoal tracking-[0.25em] uppercase">Connect via AI Agent</span>
              </div>
              <p className="text-[11px] font-medium text-charcoal/60 leading-tight mt-1">
                Talk to my AI Voice Assistant to explore my research and work in real time.
              </p>
            </div>

            <div className="space-y-4 relative z-10">
              {agentStatus === "idle" || agentStatus === "ended" ? (
                <div className="space-y-3">
                  {agentStatus === "ended" && (
                    <div className="flex items-center justify-center gap-2 py-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                      <span className="text-[9px] font-black tracking-[0.2em] uppercase text-white/50">Session Archived</span>
                    </div>
                  )}
                  <button
                    onClick={handleSummon}
                    className="w-full py-4 bg-charcoal text-white rounded-[1.25rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:bg-accentTan hover:text-charcoal hover:scale-[1.02] active:scale-95 shadow-xl flex flex-col items-center justify-center gap-1 group border border-white/5"
                  >
                    <div className="flex items-center gap-2">
                      <span>{agentStatus === "ended" ? 'Continue Conversation' : hasHistory ? 'Resume Conversation' : 'Start Voice Chat'}</span>
                      <LucideZap size={12} className="group-hover:animate-bounce" />
                    </div>
                    <span className="text-[7px] text-white/40 tracking-[0.2em] font-bold group-hover:text-charcoal/60 transition-colors">
                      {hasHistory || agentStatus === "ended" ? 'Memory Active' : 'Uplink: Ready'}
                    </span>
                  </button>
                </div>
              ) : agentStatus === "connecting" ? (
                <div className="bg-charcoal text-white rounded-2xl p-6 space-y-4 animate-pulse">
                  <div className="flex items-center justify-center h-10 gap-1.5">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="w-1 h-8 bg-accentTan rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                  </div>
                  <p className="text-[10px] font-black text-center tracking-widest uppercase">Initializing Agent...</p>
                </div>
              ) : agentStatus === "success" && token ? (
                <div className="bg-charcoal text-white rounded-[2rem] p-6 border border-accentTan/30 shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                  <LiveKitRoom
                    video={false}
                    audio={true}
                    token={token}
                    serverUrl={connectionUrl}
                    onConnected={() => {
                      console.log("LiveKit room connected");
                    }}
                    onError={(error) => {
                      console.error("LiveKit room error:", error);
                      setAgentStatus("error");
                    }}
                    onDisconnected={() => {
                      // sendBeacon fallback if terminate button wasn't used
                      if (!historySavedRef.current && transcriptRef.current.length > 0) {
                        historySavedRef.current = true;
                        navigator.sendBeacon(
                          `https://portfolio-api.quantcortex.in/history/${sessionId}`,
                          new Blob([JSON.stringify({ turns: transcriptRef.current })], { type: 'application/json' })
                        );
                      }
                      setHasHistory(transcriptRef.current.length > 0);
                      setAgentStatus(transcriptRef.current.length > 0 ? "ended" : "idle");
                      setToken("");
                      setConnectionUrl("");
                    }}
                    className="relative z-10 flex flex-col items-center gap-6"
                  >
                    <RoomAudioRenderer />
                    <AudioUnlocker />

                    {/* Minimal Header */}
                    <div className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[8px] font-black tracking-[0.2em] uppercase text-white/60">Active Link</span>
                      </div>
                      <LucideNetwork size={12} className="text-accentTan/40" />
                    </div>

                    {/* Premium Visualizer */}
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <div className="absolute inset-0 bg-accentTan/20 rounded-full animate-ping opacity-20"></div>
                      <div className="absolute inset-0 bg-accentTan/10 rounded-full animate-pulse scale-150 blur-xl"></div>
                      <div className="w-14 h-14 bg-accentTan rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(196,145,106,0.3)] relative z-10 transition-transform hover:scale-105 duration-500">
                        <LucideZap size={24} className="text-charcoal fill-charcoal/20" />
                      </div>

                      {/* Orbiting dots */}
                      <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-accentTan/40 rounded-full"></div>
                      </div>
                    </div>

                    <AgentTranscript transcriptRef={transcriptRef} />

                    <SessionPanel sessionId={sessionId} transcriptRef={transcriptRef} historySavedRef={historySavedRef} />
                  </LiveKitRoom>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
                  <p className="text-[10px] font-black text-red-500 tracking-widest uppercase">Connection Failed</p>
                  <button onClick={() => setAgentStatus("idle")} className="text-[9px] text-charcoal/40 mt-4 underline">Try Again</button>
                </div>
              )}
            </div>

            <style>
              {`
                @keyframes wave {
                  0%, 100% { transform: scaleY(0.4); }
                  50% { transform: scaleY(1); }
                }
                [class*="lk-device-select"],
                [class*="lk-media-device"],
                [class*="lk-button-group"],
                [class*="lk-control-bar"] { display: none !important; }
              `}
            </style>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center animate-bounce opacity-40">
            <ChevronDown size={20} />
          </div>
        </div>

        {/* ── RIGHT COLUMN (33%) — Pale Yellow, headline + description ── */}
        <div className="w-full lg:w-1/3 py-16 px-8 lg:p-16 bg-[#FFF4C2] flex flex-col items-start lg:items-center justify-center relative order-2 lg:order-3 border-t lg:border-t-0 border-charcoal/10">
          <div className="hero-reveal space-y-8 max-w-sm w-full">
            <h2
              className="font-sans font-black leading-[1.05] tracking-tight text-charcoal"
              style={{ fontSize: 'clamp(2.5rem, 3.2vw, 3.2rem)' }}
            >
              Architecting<br />Autonomous<br />Intelligence.
            </h2>
            <div className="space-y-6">
              <p className="text-[14px] font-medium text-charcoal/70 leading-relaxed">
                Solo-architect and AI Researcher building high-stakes systems that move beyond chat. From multi-agent forecasting engines for Indian Equities to 80+ enterprise automation pipelines, I deliver production-ready intelligence with visceral intent.
              </p>

              <div className="flex items-center gap-10 pt-6 border-t border-charcoal/10 mt-6">
                <div>
                  <div className="text-xl font-black text-charcoal">2+</div>
                  <div className="text-xs font-medium text-charcoal/50 mt-1">Years exp</div>
                </div>
                <div>
                  <div className="text-xl font-black text-charcoal">80+</div>
                  <div className="text-xs font-medium text-charcoal/50 mt-1">Projects</div>
                </div>
                <div>
                  <div className="text-xl font-black text-charcoal">3</div>
                  <div className="text-xs font-medium text-charcoal/50 mt-1">Contracts</div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-6">
                <a
                  href="/palash_resume_AIEngineer.pdf"
                  download="Palash_Joshi_CV.pdf"
                  className="bg-charcoal text-white px-8 py-3.5 rounded-full font-sans font-semibold text-sm hover:bg-charcoal/85 hover:scale-105 transition-all text-center cursor-pointer shadow-sm inline-block"
                >
                  Download CV
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
};

// --- Features Section ---

const DiagnosticShuffler = () => {
  const [items, setItems] = useState([
    "Real-time Inference",
    "Model Quantization",
    "GPU Orchestration"
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setItems(prev => {
        const next = [...prev];
        next.unshift(next.pop());
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-48 w-full flex items-center justify-center perspective-1000">
      {items.map((item, i) => (
        <div
          key={item}
          className="absolute w-full p-4 bg-white border border-charcoal/10 rounded-xl shadow-sm transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            transform: `translateY(${(i - 1) * 60}px) scale(${1 - Math.abs(i - 1) * 0.1})`,
            opacity: i === 1 ? 1 : 0.3,
            zIndex: i === 1 ? 2 : 1
          }}
        >
          <div className="flex items-center gap-3">
            <div className={cn("w-2 h-2 rounded-full", i === 1 ? "bg-accentTan animate-pulse" : "bg-charcoal/20")}></div>
            <span className="font-mono text-xs uppercase tracking-tight">{item}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const TelemetryTypewriter = () => {
  const [text, setText] = useState("");
  const fullText = "Analyzing signal metadata... Redirecting decision logic to edge node #402. System optimization complete. Ready for production deployment.";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, index));
      index = (index + 1) % (fullText.length + 10);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#121212] border border-white/10 p-4 rounded-xl font-mono text-[10px] text-accentTan h-48 overflow-hidden relative shadow-inner">
      <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
        <div className="w-2 h-2 rounded-full bg-accentTan animate-pulse"></div>
        <span className="uppercase tracking-widest text-[8px] text-accentTan/60">Live Protocol Feed</span>
      </div>
      <p className="leading-relaxed text-accentTan/90">
        {text}<span className="inline-block w-1.5 h-3 bg-accentTan ml-1 align-sub animate-pulse"></span>
      </p>
    </div>
  );
};

const VectorGraphVisualizer = () => {
  return (
    <div className="w-full h-full bg-[#FAF9F6] border border-black/5 rounded-xl relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#1A1A1A 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
      <svg viewBox="0 0 100 100" className="w-[80%] h-[80%] relative z-10">
        <g stroke="#334155" strokeWidth="0.5" strokeOpacity="0.3">
          <line x1="50" y1="20" x2="50" y2="50" />
          <line x1="75" y1="35" x2="50" y2="50" />
          <line x1="75" y1="65" x2="50" y2="50" />
          <line x1="50" y1="80" x2="50" y2="50" />
          <line x1="25" y1="65" x2="50" y2="50" />
          <line x1="25" y1="35" x2="50" y2="50" />

          <line x1="50" y1="20" x2="75" y2="35" strokeDasharray="1 1" />
          <line x1="75" y1="65" x2="50" y2="80" strokeDasharray="1 1" />
          <line x1="25" y1="65" x2="25" y2="35" strokeDasharray="1 1" />
        </g>
        <g fill="#0F172A">
          <circle cx="50" cy="20" r="2.5" />
          <circle cx="75" cy="35" r="2.5" />
          <circle cx="75" cy="65" r="2.5" />
          <circle cx="50" cy="80" r="2.5" />
          <circle cx="25" cy="65" r="2.5" />
          <circle cx="25" cy="35" r="2.5" />
        </g>
        <circle cx="50" cy="50" r="4" fill="#8E7B5F" />
        <circle cx="50" cy="50" r="10" fill="none" stroke="#8E7B5F" strokeWidth="0.5">
          <animate attributeName="r" values="4;14;4" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
};

const Features = () => {
  return (
    <section id="work" className="py-24 md:py-32 px-6 bg-[#FAF9F6] shrink-0 relative overflow-hidden">
      {/* Background Blobs for specific layout mood */}
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-[#8E7B5F] rounded-full blur-[100px] opacity-30 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-[#334155] rounded-full blur-[100px] opacity-25 -translate-y-1/2 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-16 md:mb-20 text-center md:text-left">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-[#64748B] mb-4 inline-block">VALUE PROPOSITIONS</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-[#0F172A] max-w-2xl leading-tight md:leading-none">
            Production-ready <span className="drama italic text-[#8E7B5F]">Intelligence.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group bg-[rgba(255,255,255,0.65)] backdrop-blur-2xl p-8 pt-12 rounded-boutique border border-black/10 shadow-[inset_0_3px_12px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-transform duration-300">
            <div className="mb-8 h-48 overflow-hidden flex items-center justify-center">
              <DiagnosticShuffler />
            </div>
            <h3 className="text-lg md:text-xl font-heading font-bold mb-3 flex items-start mt-2 gap-3 text-[#0F172A]">
              <div className="mt-1"><LucideCpu size={18} className="text-[#0F172A]/40 shrink-0" /></div>
              AI Systems, Built for Production
            </h3>
            <p className="text-[#334155] text-sm leading-relaxed">
              Architecting high-availability inference pipelines that scale from research prototypes to global enterprise systems.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group bg-[rgba(255,255,255,0.65)] backdrop-blur-2xl p-8 pt-12 rounded-boutique border border-black/10 shadow-[inset_0_3px_12px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-transform duration-300">
            <div className="mb-8 h-48 overflow-hidden">
              <TelemetryTypewriter />
            </div>
            <h3 className="text-lg md:text-xl font-heading font-bold mb-3 flex items-start mt-2 gap-3 text-[#0F172A]">
              <div className="mt-1"><LucideNetwork size={18} className="text-[#0F172A]/40 shrink-0" /></div>
              Decision Engines, Not Chatbots
            </h3>
            <p className="text-[#334155] text-sm leading-relaxed">
              Moving beyond generative text to active decision-making agents powered by structured retrieval and logic control.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group bg-[rgba(255,255,255,0.65)] backdrop-blur-2xl p-8 pt-12 rounded-boutique border border-black/10 shadow-[inset_0_3px_12px_rgba(0,0,0,0.06),_0_1px_2px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-transform duration-300">
            <div className="mb-8 h-48 overflow-hidden">
              <VectorGraphVisualizer />
            </div>
            <h3 className="text-lg md:text-xl font-heading font-bold mb-3 flex items-start mt-2 gap-3 text-[#0F172A]">
              <div className="mt-1"><LucideDatabase size={18} className="text-[#0F172A]/40 shrink-0" /></div>
              Scalable Data & Retrieval
            </h3>
            <p className="text-[#334155] text-sm leading-relaxed">
              Optimized vector stores and data lakes designed for high-throughput RAG systems and autonomous agent knowledge.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Philosophy Section ---


// --- Protocol Section (Sticky Stacking) ---

const DecisionTreeAnimation = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 320 320" className="w-full h-full max-w-[380px] max-h-[380px]" fill="none">
        {/* Root node */}
        <circle cx="160" cy="40" r="18" fill="#EBCFB2" stroke="#1A1A1A" strokeWidth="1.5" />
        <text x="160" y="45" textAnchor="middle" fontSize="10" fill="#1A1A1A" fontFamily="monospace">INPUT</text>

        {/* Root → Left branch line */}
        <line x1="148" y1="56" x2="88" y2="124" stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" values="100;0" dur="1.8s" repeatCount="indefinite" />
        </line>
        {/* Root → Right branch line */}
        <line x1="172" y1="56" x2="232" y2="124" stroke="#1A1A1A" strokeWidth="1.5" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" values="100;0" dur="1.8s" begin="0.4s" repeatCount="indefinite" />
        </line>

        {/* Left decision node */}
        <rect x="58" y="124" width="60" height="32" rx="6" fill="#FFF4C2" stroke="#1A1A1A" strokeWidth="1.5" />
        <text x="88" y="144" textAnchor="middle" fontSize="9" fill="#1A1A1A" fontFamily="monospace">LOGIC A</text>

        {/* Right decision node */}
        <rect x="202" y="124" width="60" height="32" rx="6" fill="#FFF4C2" stroke="#1A1A1A" strokeWidth="1.5" />
        <text x="232" y="144" textAnchor="middle" fontSize="9" fill="#1A1A1A" fontFamily="monospace">LOGIC B</text>

        {/* Left → LL */}
        <line x1="72" y1="156" x2="44" y2="216" stroke="#EBCFB2" strokeWidth="1.5" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" values="100;0" dur="1.6s" begin="0.6s" repeatCount="indefinite" />
        </line>
        {/* Left → LR */}
        <line x1="104" y1="156" x2="120" y2="216" stroke="#EBCFB2" strokeWidth="1.5" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" values="100;0" dur="1.6s" begin="0.8s" repeatCount="indefinite" />
        </line>
        {/* Right → RL */}
        <line x1="216" y1="156" x2="200" y2="216" stroke="#EBCFB2" strokeWidth="1.5" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" values="100;0" dur="1.6s" begin="1s" repeatCount="indefinite" />
        </line>
        {/* Right → RR */}
        <line x1="248" y1="156" x2="276" y2="216" stroke="#EBCFB2" strokeWidth="1.5" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" values="100;0" dur="1.6s" begin="1.2s" repeatCount="indefinite" />
        </line>

        {/* Leaf nodes */}
        {[
          { cx: 44, label: "R-1" },
          { cx: 120, label: "R-2" },
          { cx: 200, label: "R-3" },
          { cx: 276, label: "R-4" },
        ].map(({ cx, label }, i) => (
          <g key={label}>
            <circle cx={cx} cy={228} r="16" fill="#1A1A1A" stroke="#EBCFB2" strokeWidth="1.5">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
            </circle>
            <text x={cx} y="232" textAnchor="middle" fontSize="8" fill="#EBCFB2" fontFamily="monospace">{label}</text>
          </g>
        ))}

        {/* Converge lines to output */}
        {[44, 120, 200, 276].map((cx, i) => (
          <line key={cx} x1={cx} y1="244" x2="160" y2="284" stroke="#1A1A1A" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 4">
            <animate attributeName="stroke-dashoffset" values="80;0" dur="2s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
          </line>
        ))}

        {/* Output node */}
        <rect x="120" y="284" width="80" height="28" rx="14" fill="#1A1A1A" />
        <text x="160" y="302" textAnchor="middle" fontSize="9" fill="#EBCFB2" fontFamily="monospace" fontWeight="bold">OUTPUT</text>
      </svg>
    </div>
  );
};

// --- Project Showcase Section (One at a time) ---

const QuantCortexAnimation = () => (
  <div className="w-full h-full flex items-center justify-center p-4">
    <svg viewBox="0 0 400 300" className="w-full h-full">
      {/* Central Hub */}
      <rect x="160" y="120" width="80" height="60" rx="4" fill="none" stroke="#8E7B5F" strokeWidth="2" />
      <text x="200" y="155" textAnchor="middle" fontSize="10" fill="#1A1A1A" fontFamily="monospace">SYNTHESIZER</text>

      {/* Agents */}
      {[
        { x: 50, y: 50, label: "BULL AGENT" },
        { x: 350, y: 50, label: "BEAR AGENT" },
        { x: 50, y: 250, label: "MACRO AGENT" },
        { x: 350, y: 250, label: "BSE OCR" }
      ].map((agent, i) => (
        <g key={i}>
          <circle cx={agent.x} cy={agent.y} r="25" fill="#EBCFB2" stroke="#1A1A1A" strokeWidth="1" />
          <text x={agent.x} y={agent.y + 2} textAnchor="middle" fontSize="8" fill="#1A1A1A" fontFamily="monospace">{agent.label}</text>
          <path d={`M${agent.x},${agent.y} L200,150`} stroke="#1A1A1A" strokeWidth="0.5" strokeDasharray="4 4">
            <animate attributeName="stroke-dashoffset" values="40;0" dur="2s" repeatCount="indefinite" />
          </path>
        </g>
      ))}

      {/* Pulsing signal center */}
      <circle cx="200" cy="150" r="10" fill="#8E7B5F" opacity="0.2">
        <animate attributeName="r" values="10;30;10" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  </div>
);

const SDRAutomationAnimation = () => {
  const steps = [
    { label: "LEAD SCRAPE" },
    { label: "ENRICHMENT" },
    { label: "LLM PERS." },
    { label: "OUTREACH" },
    { label: "CRM SYNC" }
  ];

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <svg viewBox="0 0 350 500" className="w-full h-full">
        {/* Connection Spine */}
        <rect x="170" y="40" width="10" height="420" rx="5" fill="#1A1A1A" fillOpacity="0.03" />

        {steps.map((step, i) => (
          <g key={i}>
            {/* Pulsing Aura */}
            <circle cx="175" cy={60 + (i * 95)} r="50" fill="#FFF4C2" opacity="0.1">
              <animate attributeName="r" values="45;55;45" dur="2.5s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </circle>

            {/* Primary Node */}
            <circle cx="175" cy={60 + (i * 95)} r="44" fill="#FFF4C2" stroke="#1A1A1A" strokeWidth="2" />
            <text
              x="175"
              y={60 + (i * 95)}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="#1A1A1A"
              fontFamily="monospace"
              fontWeight="900"
            >
              {step.label}
            </text>

            {/* Flow line animation */}
            {i < steps.length - 1 && (
              <line x1="175" y1={104 + (i * 95)} x2="175" y2={151 + (i * 95)} stroke="#8E7B5F" strokeWidth="3" strokeDasharray="6 4">
                <animate attributeName="stroke-dashoffset" values="20;0" dur="1s" repeatCount="indefinite" />
              </line>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

const EnterpriseAutomationAnimation = () => {
  const steps = [
    { main: "ID MANUAL", sub: "PROCESSES" },
    { main: "API INTEGRATION", sub: "N8N, MAKE, PYTHON" },
    { main: "SCHEDULED", sub: "FLOWS" }
  ];

  return (
    <div className="w-full h-full flex items-center justify-center p-2">
      <svg viewBox="0 0 380 400" className="w-full h-full">
        <rect x="185" y="50" width="10" height="300" rx="5" fill="#1A1A1A" fillOpacity="0.03" />

        {steps.map((step, i) => (
          <g key={i}>
            <rect x="65" y={40 + (i * 125)} width="240" height="85" rx="12" fill="#F9F3EA" stroke="#1A1A1A" strokeWidth="2" />
            <text x="185" y={75 + (i * 125)} textAnchor="middle" fontSize="12" fill="#1A1A1A" fontFamily="monospace" fontWeight="900">
              {step.main}
            </text>
            <text x="185" y={98 + (i * 125)} textAnchor="middle" fontSize="9" fill="#8E7B5F" fontFamily="monospace" fontWeight="bold">
              {step.sub}
            </text>

            {i < steps.length - 1 && (
              <path d={`M185,${125 + (i * 125)} L185,${165 + (i * 125)}`} stroke="#1A1A1A" strokeWidth="2" strokeDasharray="4 4" />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

const ProjectShowcase = () => {
  const sectionRef = useRef(null);

  const projects = [
    {
      id: "quantcortex",
      num: "01",
      tag: "EQUITY RESEARCH PLATFORM",
      title: "QuantCortex Engine",
      desc: "A solo-built terminal for Indian Equities. Features 3-layer OCR for annual reports and multi-agent synthesis for forecasting.",
      stack: "FinBERT • LLaMA-3.3 • ChromaDB",
      animation: <QuantCortexAnimation />
    },
    {
      id: "sdr",
      num: "02",
      tag: "SALES AUTOMATION",
      title: "AI SDR Pipelines",
      desc: "Owner of the backend orchestration for outbound engagement. Reduced manual prospecting time by 80% using automated personalization.",
      stack: "n8n • LLM Logic • API Mesh",
      animation: <SDRAutomationAnimation />
    },
    {
      id: "growwstacks",
      num: "03",
      tag: "INFRASTRUCTURE",
      title: "Enterprise Automation",
      desc: "Architected 80+ end-to-end automation solutions. Specializing in manual process discovery and scheduled API-mesh orchestration.",
      stack: "n8n • Make • Python",
      animation: <EnterpriseAutomationAnimation />
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const inners = gsap.utils.toArray('.project-card-inner');
      inners.forEach((inner, i) => {
        if (i === inners.length - 1) return;
        const card = inner.closest('.project-card');
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: sectionRef.current,
          end: "bottom bottom",
          pin: true,
          pinSpacing: false,
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            gsap.set(inner, { scale: 1 - (p * 0.1), filter: `blur(${p * 5}px)`, opacity: 1 - p });
          }
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="projects" className="relative bg-cream overflow-hidden">
      {projects.map((proj, i) => (
        <div key={proj.id} className="project-card h-screen w-full sticky top-0 bg-cream border-t border-charcoal/10 first:border-t-0 overflow-hidden">
          <div className="project-card-inner w-full h-full flex items-center justify-center p-6 md:p-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-7xl items-center">
              <div className="flex flex-col gap-6">
                <span className="font-mono text-charcoal/30">{proj.num} / {proj.tag}</span>
                <h3 className="text-5xl md:text-8xl font-heading font-bold leading-none tracking-tighter">{proj.title}</h3>
                <p className="text-charcoal/50 text-xl leading-relaxed max-w-md">{proj.desc}</p>
                <div className="space-y-4 pt-4">
                  <div className="text-xs font-bold text-accentTan tracking-[0.2em] uppercase">Core Stack</div>
                  <div className="font-mono text-sm text-charcoal/80 bg-white/50 w-fit px-4 py-2 rounded-lg border border-charcoal/5 italic">
                    {proj.stack}
                  </div>
                </div>
              </div>
              <div className="relative aspect-square flex items-center justify-center bg-white/40 rounded-3xl border border-charcoal/5 shadow-inner overflow-hidden">
                <div className="absolute top-4 left-4 flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-400/50"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-400/50"></div>
                  <div className="w-2 h-2 rounded-full bg-green-400/50"></div>
                </div>
                {proj.animation}
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

// --- Experience Trek Section (Horizontal Mountain Ridge) ---

const ExperienceTrek = () => {
  const sectionRef = useRef(null);
  const triggerRef = useRef(null);
  const pathRef = useRef(null);
  const cardRefs = useRef([]);

  // scrollOffset = px of scroll at which the animated path reaches this peak
  // Calculated from cumulative polyline segment lengths as a fraction of total path length (3132.8),
  // multiplied by the path-drawing scroll range (3500 * 0.8 = 2800).
  const experiences = [
    {
      id: "secretweapon",
      abbr: "SWTS",
      phase: "01 / BASE CAMP",
      company: "Secret Weapon Trading Solutions",
      role: "Algorithm Developer",
      period: "2024 - 2025",
      projects: "Algo Trading Logic",
      mastery: ["Pine Script", "Performance", "Python"],
      desc: "Starting the climb. Built core backtesting logic and evaluated market strategies.",
      peakCoords: { x: 400, y: 350 },
      scrollOffset: 381
    },
    {
      id: "growwstacks",
      abbr: "GS",
      phase: "02 / ASCENDING",
      company: "GrowwStacks",
      role: "Software Engineer",
      period: "2025 - 2026",
      projects: "80+ Deployments",
      mastery: ["Docker", "Terraform", "Azure", "RAG"],
      desc: "Massive scale-up. Delivered automation across 80+ enterprise projects.",
      peakCoords: { x: 1200, y: 250 },
      scrollOffset: 1150
    },
    {
      id: "nxl",
      abbr: "NXL",
      phase: "03 / HIGH SLOPE",
      company: "NXL",
      role: "AI Developer",
      period: "2026",
      projects: "AI SDR Pipelines",
      mastery: ["n8n", "LLM Logic", "CRM"],
      desc: "Specializing in the thin-air of AI logic and automated sales agents.",
      peakCoords: { x: 2000, y: 150 },
      scrollOffset: 1954
    },
    {
      id: "quantcortex",
      abbr: "QC",
      phase: "04 / THE CURRENT SUMMIT",
      company: "QuantCortex",
      role: "AI Researcher",
      period: "Present",
      projects: "AI Powered Equity Research",
      mastery: ["FinBERT", "ChromaDB", "LLaMA-3.3"],
      desc: "The current vantage point. Architecting a full-stack, solo Indian Equity platform.",
      peakCoords: { x: 2800, y: 50 },
      scrollOffset: 2800
    }
  ];

  const totalWidth = 3500;
  // The Full Ridge (for the background shadow)
  const fullRidgeData = "M0,500 L400,350 L800,450 L1200,250 L1600,400 L2000,150 L2400,350 L2800,50 L3500,50";
  // The Journey Path — plateau at the summit, still walking
  const journeyPathData = "M0,500 L400,350 L800,450 L1200,250 L1600,400 L2000,150 L2400,350 L2800,50 L3500,50";

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Horizontal Scroll Pinning
      gsap.to(sectionRef.current, {
        x: -(totalWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
          trigger: triggerRef.current,
          pin: true,
          scrub: 1,
          start: "top top",
          end: () => `+=${totalWidth}`,
          invalidateOnRefresh: true,
        }
      });

      // Animate the journey path drawing
      const path = pathRef.current;
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: () => `+=${totalWidth * 0.8}`,
          scrub: 0.5,
        }
      });

      // Dynamic Shading: Darken the mountain fill as we ascend
      gsap.to("#mountain-fill", {
        fill: "#EBCFB2",
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top top",
          end: () => `+=${totalWidth}`,
          scrub: true,
        }
      });

      // Set initial hidden state for each card
      cardRefs.current.forEach(card => {
        if (card) gsap.set(card, { opacity: 0, x: 16 });
      });

      // Reveal each card when the animated path line crosses its peak
      experiences.forEach((exp, i) => {
        const card = cardRefs.current[i];
        if (!card) return;
        ScrollTrigger.create({
          trigger: triggerRef.current,
          start: "top top",
          end: () => `+=${exp.scrollOffset}`,
          onLeave: () => gsap.to(card, { opacity: 1, x: 0, duration: 0.55, ease: "power2.out" }),
          onLeaveBack: () => gsap.to(card, { opacity: 0, x: 16, duration: 0.3, ease: "power2.in" }),
        });
      });

    }, triggerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={triggerRef} className="overflow-hidden bg-[#FFF4C2] border-y border-charcoal/5 relative">
      {/* Soft atmospheric glow at the top */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

      {/* Section Title - Aligned with Grid */}
      <div className="absolute top-12 md:top-24 left-0 w-full z-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <span className="font-mono text-[12px] font-bold text-charcoal/50 tracking-[0.3em] uppercase block mb-4">Progression</span>
          <h2 className="text-4xl md:text-6xl font-heading font-black text-charcoal tracking-tighter">My <span className="drama italic">Journey.</span></h2>
        </div>
      </div>

      <div ref={sectionRef} className="h-screen relative flex items-center" style={{ width: `${totalWidth}px` }}>

        {/* Experience Cards — absolutely positioned to the right of each peak marker.
            SVG maps 3500×500 viewBox onto 3500px wide × 80vh tall, so:
            screen-x = svgX (1:1), screen-top = 20vh + (svgY/500)*80vh */}
        {experiences.map((exp, i) => (
          <div
            key={exp.id}
            ref={el => { cardRefs.current[i] = el; }}
            className="absolute z-10"
            style={{
              left: `${exp.peakCoords.x + 44}px`,
              top: `calc(20vh + ${(exp.peakCoords.y / 500) * 80}vh - 88px)`,
              width: '260px',
            }}
          >
            <div className="bg-white/90 backdrop-blur-md border border-charcoal/10 p-6 rounded-2xl shadow-xl">
              <div className="flex justify-between items-start mb-3">
                <span className="font-mono text-[10px] bg-charcoal text-white px-2 py-0.5 rounded uppercase">{exp.period}</span>
                <span className="text-[11px] font-bold text-charcoal">{exp.projects}</span>
              </div>
              <h4 className="text-xl font-heading font-bold text-charcoal leading-tight mb-2">{exp.company}</h4>
              <p className="text-xs text-charcoal/70 leading-relaxed mb-4">{exp.desc}</p>
              <div className="flex flex-wrap gap-1.5 border-t border-charcoal/10 pt-3">
                {exp.mastery.map(m => (
                  <span key={m} className="text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal/50 bg-charcoal/5 px-2 py-0.5 rounded">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* The Mountain Path SVG */}
        <svg viewBox="0 0 3500 500" className="absolute left-0 bottom-0 w-full h-[80%] overflow-visible">
          {/* Mountain Fill (Visible Body) */}
          <path
            id="mountain-fill"
            d={fullRidgeData + " L3500,500 L0,500 Z"}
            fill="#F9F3EA"
            className="opacity-60 transition-colors duration-1000"
          />

          {/* Static Ridge (The background silhouette) */}
          <path
            d={fullRidgeData}
            fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="2"
          />
          {/* Active Journey Path (Stops at Summit) */}
          <path
            ref={pathRef}
            d={journeyPathData}
            fill="none" stroke="#8E7B5F" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
          />

          {/* Peak markers — dot + pulse ring + phase/role label only */}
          {experiences.map((exp) => (
            <foreignObject
              key={exp.id}
              x={exp.peakCoords.x - 120}
              y={exp.peakCoords.y - 8}
              width="240"
              height="140"
            >
              <div className="flex flex-col items-center">
                {/* Landmark dot */}
                <div className="relative w-10 h-10">
                  <div className="w-10 h-10 bg-charcoal rounded-full flex items-center justify-center border-4 border-accentTan shadow-2xl">
                    <span className="text-accentTan font-black font-mono" style={{ fontSize: exp.abbr.length > 3 ? '7px' : '10px' }}>{exp.abbr}</span>
                  </div>
                  <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-accentTan animate-ping opacity-20"></div>
                </div>
                {/* Label */}
                <div className="mt-3 text-center space-y-1.5">
                  <p className="font-mono text-[9px] font-bold text-charcoal/60 uppercase tracking-[0.12em] whitespace-nowrap">{exp.phase}</p>
                  <p className="font-heading font-black text-charcoal tracking-tight uppercase text-[13px] whitespace-nowrap">{exp.role}</p>
                </div>
              </div>
            </foreignObject>
          ))}
        </svg>

        {/* Floating Instruction */}
        <div className="absolute bottom-12 left-12 font-mono text-[10px] text-charcoal/30 flex items-center gap-3">
          <div className="w-8 h-px bg-charcoal/30"></div>
          SCROLL TO NAVIGATE THE RIDGE
        </div>
      </div>
    </div>
  );
};

// --- Tech Marquee Section ---

const TechMarquee = () => {
  const techs = [
    { name: "Python", Icon: SiPython, color: "#3776AB" },
    { name: "FastAPI", Icon: SiFastapi, color: "#009688" },
    { name: "Next.js", Icon: SiNextdotjs, color: "#ffffff" },
    { name: "PyTorch", Icon: SiPytorch, color: "#EE4C2C" },
    { name: "Transformers", Icon: SiHuggingface, color: "#FFD21E" },
    { name: "ChromaDB", Icon: null, color: null },
    { name: "Groq", Icon: null, color: null },
    { name: "LLaMA", Icon: SiMeta, color: "#0082FB" },
    { name: "Docker", Icon: SiDocker, color: "#2496ED" },
    { name: "Terraform", Icon: SiTerraform, color: "#7B42BC" },
    { name: "Azure", Icon: null, color: null },
    { name: "GCP", Icon: SiGooglecloud, color: "#4285F4" },
    { name: "Nginx", Icon: SiNginx, color: "#009639" },
    { name: "Redis", Icon: SiRedis, color: "#FF4438" },
    { name: "n8n", Icon: SiN8N, color: "#EA4B71" },
    { name: "Make.com", Icon: SiMake, color: "#6D00CC" },
    { name: "Selenium", Icon: SiSelenium, color: "#43B02A" },
    { name: "SQLite", Icon: SiSqlite, color: "#44A1C7" },
    { name: "Pine Script", Icon: SiTradingview, color: "#2962FF" },
    { name: "React", Icon: SiReact, color: "#61DAFB" },
  ];

  return (
    <section className="py-24 bg-charcoal overflow-hidden border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <span className="font-mono text-[12px] font-bold text-accentTan tracking-[0.3em] uppercase block mb-4">Core Expertise</span>
        <h2 className="text-4xl md:text-6xl font-heading font-black text-white tracking-tighter text-left">My Technical <span className="drama italic text-accentTan">Arsenal.</span></h2>
      </div>

      <div className="flex whitespace-nowrap overflow-hidden group">
        <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
          {[...techs, ...techs].map((tech, i) => (
            <div key={i} className="flex items-center gap-3 mx-10 group/item cursor-default">
              {tech.Icon
                ? <tech.Icon size={20} style={{ color: tech.color }} className="opacity-70 group-hover/item:opacity-100 transition-opacity shrink-0" />
                : <div className="w-1.5 h-1.5 bg-accentTan rounded-full shrink-0" />
              }
              <span className="text-white/40 font-mono text-sm uppercase tracking-[0.3em] font-bold group-hover/item:text-white/80 transition-colors">
                {tech.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            animation: marquee 35s linear infinite;
          }
        `}
      </style>
    </section>
  );
};

// --- Footer ---

const Footer = () => {
  return (
    <footer className="bg-charcoal px-6 pt-32 pb-12 rounded-t-xlarge text-cream">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          <div className="md:col-span-6 space-y-6">
            <h2 className="text-4xl font-heading font-bold tracking-tight uppercase">Palash Joshi</h2>
            <p className="text-cream/40 max-w-sm leading-relaxed">
              Architecting the next generation of industrial intelligence. Digital products built with visceral intent.
            </p>
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest bg-accentTan/10 px-4 py-2 rounded-full w-fit">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              System Operational
            </div>
          </div>

          <div className="md:col-span-3 space-y-4">
            <p className="font-mono text-[10px] text-cream/30 uppercase tracking-widest">Navigation</p>
            <ul className="space-y-2 font-sans">
              <li><a href="#work" className="hover:text-accentTan transition-colors">Work</a></li>

              <li><a href="#projects" className="hover:text-accentTan transition-colors">Projects</a></li>
              <li><a href="https://quantcortex.in" target="_blank" rel="noopener noreferrer" className="hover:text-accentTan transition-colors">QuantCortex</a></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-4">
            <p className="font-mono text-[10px] text-cream/30 uppercase tracking-widest">Social</p>
            <ul className="space-y-2 font-sans">
              <li><a href="https://www.linkedin.com/in/palash-joshi-901656286/" target="_blank" rel="noopener noreferrer" className="hover:text-accentTan transition-colors">LinkedIn</a></li>
              <li><a href="https://github.com/Palash-Devo7" target="_blank" rel="noopener noreferrer" className="hover:text-accentTan transition-colors">GitHub</a></li>
              <li><a href="mailto:palash@quantcortex.in" className="hover:text-accentTan transition-colors">Email</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-cream/10 flex flex-col md:flex-row justify-between items-center gap-6 font-mono text-[10px] text-cream/20 uppercase tracking-widest">
          <p>© 2026 Palash Joshi. All Rights Reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-cream transition-colors">Privacy</a>
            <a href="#" className="hover:text-cream transition-colors">Legal</a>
            <a href="#" className="hover:text-cream transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  useEffect(() => {
    const handleScroll = () => {
      const h = document.documentElement;
      const scrollTop = h.scrollTop || document.body.scrollTop;
      const scrollHeight = (h.scrollHeight || document.body.scrollHeight) - h.clientHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      const el = document.getElementById('scroll-progress');
      if (el) el.style.transform = `scaleX(${progress})`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="selection:bg-accentTan selection:text-charcoal text-charcoal">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] origin-left bg-accentTan scale-x-0" id="scroll-progress"></div>

      <Hero />
      <Features />
      <ExperienceTrek />
      <TechMarquee />
      <ProjectShowcase />

      {/* Final CTA Section */}
      <section className="bg-cream py-40 flex justify-center items-center px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-5xl md:text-8xl font-heading font-bold tracking-tighter leading-none">
            Ready to <span className="drama italic text-accentTan underline decoration-accentTan/20 decoration-8">Sovereignize?</span>
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <a href="mailto:palash@quantcortex.in" className="bg-charcoal text-cream px-10 py-5 rounded-full font-heading font-bold text-xl magnetic">
              Let's Build Together
            </a>
            <a href="https://quantcortex.in" target="_blank" rel="noopener noreferrer" className="border border-charcoal/20 text-charcoal px-10 py-5 rounded-full font-heading font-bold text-xl magnetic hover:bg-charcoal hover:text-cream transition-colors duration-500">
              Explore QuantCortex
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

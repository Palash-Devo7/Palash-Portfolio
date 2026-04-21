import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LucideArrowRight, LucideCheckCircle2, LucideCpu, LucideDatabase, LucideGitBranch, LucideNetwork, LucideZap, Github, Linkedin, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
        <a href="#" className="hover:text-accentTan transition-colors"><Github size={18} /></a>
        <a href="#" className="hover:text-accentTan transition-colors"><Linkedin size={18} /></a>
      </div>

      {/* RIGHT: Nav links — aligned to right column */}
      <div className="hidden lg:flex w-1/3 justify-end gap-10 items-center">
        <a href="#work" className="hover:opacity-40 transition-opacity">latest work</a>

        <a href="#" className="bg-charcoal text-white px-5 py-2.5 rounded-full hover:bg-charcoal/90 transition-all hover:scale-105">schedule call</a>
      </div>
    </nav>
  );
};

const Hero = () => {
  const containerRef = useRef(null);

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
        <div className="w-full lg:w-1/3 min-h-[40vh] bg-[#FFF4C2] flex flex-col justify-center px-6 lg:px-8 relative overflow-hidden order-3 lg:order-1 border-t lg:border-t-0 border-charcoal/10">
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
        <div className="w-full lg:w-1/3 py-16 lg:py-0 bg-[#EBCFB2] relative overflow-hidden flex flex-col items-center justify-center order-1 lg:order-2">
          <img
            src="palash_pic.jpeg"
            alt="Portrait of Palash Joshi"
            className="w-[60%] lg:w-[75%] aspect-square object-cover object-center shadow-md rounded-full lg:mt-0"
          />
          <div className="w-max mt-8 flex justify-center gap-10 items-center text-xs font-semibold text-charcoal tracking-wider" style={{ fontFamily: '"Inter", sans-serif' }}>
            <button className="border-b border-charcoal/30 pb-1 hover:border-charcoal hover:opacity-70 transition-all cursor-pointer">Latest Work</button>
            <button className="border-b border-charcoal/30 pb-1 hover:border-charcoal hover:opacity-70 transition-all cursor-pointer">Case Studies</button>
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

  const experiences = [
    {
      id: "secretweapon",
      phase: "01 / BASE CAMP",
      company: "Secret Weapon Trading",
      role: "Algorithm Developer",
      period: "2024 - 2025",
      projects: "Algo Trading Logic",
      mastery: ["Pine Script", "Performance", "Python"],
      desc: "Starting the climb. Built core backtesting logic and evaluated market strategies.",
      peakCoords: { x: 400, y: 350 }
    },
    {
      id: "growwstacks",
      phase: "02 / ASCENDING",
      company: "GrowwStacks",
      role: "Software Engineer",
      period: "2025 - 2026",
      projects: "80+ Deployments",
      mastery: ["Docker", "Terraform", "Azure", "RAG"],
      desc: "Massive scale-up. Delivered automation across 80+ enterprise projects.",
      peakCoords: { x: 1200, y: 250 }
    },
    {
      id: "nxl",
      phase: "03 / HIGH SLOPE",
      company: "NXL",
      role: "AI Developer",
      period: "2026",
      projects: "AI SDR Pipelines",
      mastery: ["n8n", "LLM Logic", "CRM"],
      desc: "Specializing in the thin-air of AI logic and automated sales agents.",
      peakCoords: { x: 2000, y: 150 }
    },
    {
      id: "quantcortex",
      phase: "04 / THE CURRENT SUMMIT",
      company: "QuantCortex",
      role: "AI Researcher",
      period: "Present",
      projects: "1 Massive Core",
      mastery: ["FinBERT", "ChromaDB", "LLaMA-3.3"],
      desc: "The current vantage point. Architecting a full-stack, solo Indian Equity platform.",
      peakCoords: { x: 2800, y: 50 }
    }
  ];

  // The Full Ridge (for the background shadow)
  const fullRidgeData = "M0,500 L400,350 L800,450 L1200,250 L1600,400 L2000,150 L2400,350 L2800,50 L3500,500";
  // The Journey Path (stops exactly at the final peak)
  const journeyPathData = "M0,500 L400,350 L800,450 L1200,250 L1600,400 L2000,150 L2400,350 L2800,50";

  useEffect(() => {
    const ctx = gsap.context(() => {
      const totalWidth = 3500;

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
          // Map drawing end to the point on the track where the peak is reached (~80% of total width)
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

      <div ref={sectionRef} className="h-screen relative flex items-center" style={{ width: '3500px' }}>

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

          {/* Peak Indicators & Content */}
          {experiences.map((exp) => (
            <foreignObject
              key={exp.id}
              x={exp.peakCoords.x - 150}
              y={exp.peakCoords.y - 300}
              width="350"
              height="400"
            >
              <div className="flex flex-col items-center justify-end h-full group p-4">
                {/* Information Card */}
                <div className="bg-white/90 backdrop-blur-md border border-charcoal/10 p-8 rounded-2xl shadow-xl mb-12 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 max-w-[300px]">
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-mono text-[10px] bg-charcoal text-white px-2 py-0.5 rounded uppercase">{exp.period}</span>
                    <div className="text-[12px] font-bold text-charcoal">{exp.projects}</div>
                  </div>
                  <h4 className="text-2xl font-heading font-bold text-charcoal leading-tight mb-3">{exp.company}</h4>
                  <p className="text-sm text-charcoal/70 leading-relaxed mb-6">{exp.desc}</p>
                  <div className="flex flex-wrap gap-2 border-t border-charcoal/10 pt-4">
                    {exp.mastery.map(m => (
                      <span key={m} className="text-[10px] font-mono font-bold uppercase tracking-widest text-charcoal/50 bg-charcoal/5 px-2 py-1 rounded">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                {/* The Landmark Marker */}
                <div className="relative">
                  <div className="w-12 h-12 bg-charcoal rounded-full flex items-center justify-center border-4 border-accentTan group-hover:scale-125 transition-transform duration-500 shadow-2xl">
                    <span className="text-accentTan font-black text-xs font-mono">{exp.id.slice(0, 2).toUpperCase()}</span>
                  </div>
                  {/* Pulse Effect */}
                  <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-accentTan animate-ping opacity-20"></div>
                </div>

                {/* Label (always visible) */}
                <div className="mt-4 text-center">
                  <p className="font-mono text-[10px] font-bold text-charcoal/30 uppercase tracking-[0.2em]">{exp.phase}</p>
                  <p className="font-heading font-black text-charcoal tracking-tighter uppercase text-sm mt-1">{exp.role}</p>
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
    "Python", "FastAPI", "Next.js 15", "PyTorch", "Transformers",
    "ChromaDB", "Groq", "LLaMA-3.3", "Docker", "Terraform",
    "Azure", "GCP", "Nginx", "Redis", "n8n", "Make.com",
    "Selenium", "SQLite", "Pine Script", "React"
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
            <div key={i} className="flex items-center gap-4 mx-12">
              <div className="w-1.5 h-1.5 bg-accentTan rounded-full"></div>
              <span className="text-white/40 font-mono text-sm uppercase tracking-[0.3em] font-bold hover:text-accentTan transition-colors cursor-default">
                {tech}
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
            animation: marquee 30s linear infinite;
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
              <li><a href="#" className="hover:text-accentTan transition-colors">Work</a></li>

              <li><a href="#" className="hover:text-accentTan transition-colors">Protocol</a></li>
              <li><a href="#" className="hover:text-accentTan transition-colors">QuantCortex</a></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-4">
            <p className="font-mono text-[10px] text-cream/30 uppercase tracking-widest">Social</p>
            <ul className="space-y-2 font-sans">
              <li><a href="#" className="hover:text-accentTan transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-accentTan transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-accentTan transition-colors">Twitter (X)</a></li>
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
  return (
    <main className="selection:bg-accentTan selection:text-charcoal text-charcoal">
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] origin-left bg-accentTan scale-x-0" id="scroll-progress"></div>
      <script>
        {`
          window.addEventListener('scroll', () => {
            const h = document.documentElement;
            const b = document.body;
            const st = 'scrollTop';
            const sh = 'scrollHeight';
            const progress = (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight);
            document.getElementById('scroll-progress').style.transform = \`scaleX(\${progress})\`;
          });
        `}
      </script>

      <Hero />
      <Features />
      <ExperienceTrek />
      <TechMarquee />
      <ProjectShowcase />

      {/* Final CTA Section */}
      <section className="bg-cream py-40 flex flex-center px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <h2 className="text-5xl md:text-8xl font-heading font-bold tracking-tighter leading-none">
            Ready to <span className="drama italic text-accentTan underline decoration-accentTan/20 decoration-8">Sovereignize?</span>
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <button className="bg-charcoal text-cream px-10 py-5 rounded-full font-heading font-bold text-xl magnetic">
              Let's Build Together
            </button>
            <button className="border border-charcoal/20 text-charcoal px-10 py-5 rounded-full font-heading font-bold text-xl magnetic hover:bg-charcoal hover:text-cream transition-colors duration-500">
              Explore QuantCortex
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

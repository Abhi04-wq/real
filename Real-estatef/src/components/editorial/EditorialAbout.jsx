import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useScrollDirection } from "../../hooks/useScrollDirection";
import {
  Building2,
  Users,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Activity,
  CheckCircle2,
  ArrowRight,
  Layers,
  Compass,
  Cpu,
  BarChart3,
  ExternalLink,
  ChevronRight,
  Lock,
} from "lucide-react";

// Subtle Architectural Blueprint SVG with animated stroke dash
const ArchitecturalBlueprint = () => (
  <svg
    viewBox="0 0 420 250"
    fill="none"
    className="absolute -right-6 -bottom-6 w-84 h-56 stroke-[#6F9BB8]/20 pointer-events-none select-none"
  >
    <rect x="20" y="20" width="380" height="210" strokeWidth="1" strokeDasharray="4 4" />
    <rect x="50" y="50" width="150" height="135" strokeWidth="1.2" stroke="#6F9BB8" strokeOpacity="0.3" />
    <rect x="230" y="50" width="140" height="75" strokeWidth="1.2" stroke="#6F9BB8" strokeOpacity="0.3" />
    <rect x="230" y="145" width="140" height="40" strokeWidth="1.2" stroke="#6F9BB8" strokeOpacity="0.3" />
    {/* Door swing arcs */}
    <path d="M 50 115 A 40 40 0 0 1 90 155" strokeWidth="0.8" strokeDasharray="3 3" stroke="#D6A85F" strokeOpacity="0.4" />
    <path d="M 230 95 A 30 30 0 0 1 260 125" strokeWidth="0.8" strokeDasharray="3 3" stroke="#D6A85F" strokeOpacity="0.4" />
    <line x1="20" y1="125" x2="400" y2="125" strokeWidth="0.6" strokeDasharray="4 4" />
    <line x1="200" y1="20" x2="200" y2="230" strokeWidth="0.6" strokeDasharray="4 4" />
    {/* Blueprint CAD Crosshairs */}
    <path d="M 15 15 L 25 15 M 20 10 L 20 20" strokeWidth="1" stroke="#D6A85F" strokeOpacity="0.7" />
    <path d="M 395 15 L 405 15 M 400 10 L 400 20" strokeWidth="1" stroke="#D6A85F" strokeOpacity="0.7" />
    <path d="M 15 235 L 25 235 M 20 230 L 20 240" strokeWidth="1" stroke="#D6A85F" strokeOpacity="0.7" />
    <path d="M 395 235 L 405 235 M 400 230 L 400 240" strokeWidth="1" stroke="#D6A85F" strokeOpacity="0.7" />
    {/* Bloomberg-Style Data Annotations */}
    <text x="75" y="42" fill="#6F9BB8" fontSize="8.5" letterSpacing="1.2" fontFamily="monospace" opacity="0.8">
      ZONE 01 // 142.5 M² [ESCROW LOCKED]
    </text>
    <text x="245" y="42" fill="#D6A85F" fontSize="8.5" letterSpacing="1.2" fontFamily="monospace" opacity="0.8">
      CORE SUITE // CAP 8.4%
    </text>
  </svg>
);

// High-precision Animated Number Counter (Bidirectional: counts up on entry, resets on exit)
function CountUpNumber({ end, decimals = 0, prefix = "", suffix = "", duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-30px" });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!inView) {
      setVal(0);
      return;
    }
    if (shouldReduceMotion) {
      setVal(end);
      return;
    }

    let startTimestamp = null;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setVal(easeProgress * end);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setVal(end);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [inView, end, duration, shouldReduceMotion]);

  const formatted = decimals > 0
    ? val.toFixed(decimals)
    : Math.floor(val).toLocaleString("en-IN");

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

// 3D Tilt Card Container with smooth spring physics & gold sheen
function TiltCard({ children, className = "", maxTilt = 4.5, withSheen = true, ...props }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [mouseCoord, setMouseCoord] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -maxTilt;
    const rotY = ((x - centerX) / centerX) * maxTilt;
    setRotate({ x: rotX, y: rotY });
    setMouseCoord({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotate.x.toFixed(2)}deg) rotateY(${rotate.y.toFixed(2)}deg)`,
        transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
      className={`relative will-change-transform group/tilt ${className}`}
      {...props}
    >
      {/* Subtle Gold Light Sweep across Card Surface */}
      {withSheen && !shouldReduceMotion && (
        <div
          className="pointer-events-none absolute inset-0 z-30 rounded-inherit opacity-0 group-hover/tilt:opacity-100 transition-opacity duration-700"
          style={{
            background: `radial-gradient(400px circle at ${mouseCoord.x}% ${mouseCoord.y}%, rgba(214,168,95,0.09), transparent 60%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

export default function EditorialAbout({ onOpenEnquiry }) {
  const containerRef = useRef(null);
  const sectionInView = useInView(containerRef, { once: false, amount: 0.15 });
  const shouldReduceMotion = useReducedMotion();
  const { scrollDirection } = useScrollDirection();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Layered Parallax speeds (Blueprint 0.10x, Main content 0.30x)
  const bgGridY = useTransform(scrollYProgress, [0, 1], [-25, 25]);
  const contentParallaxY = useTransform(scrollYProgress, [0, 1], [35, -35]);

  // Mouse-following spotlight on the deep navy background
  const [spotlightPos, setSpotlightPos] = useState({ x: 600, y: 350 });

  const handleContainerMouseMove = (e) => {
    if (shouldReduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSpotlightPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Horizontal Lead Pipeline Steps with Active Automation
  const pipelineStages = [
    { id: "new", label: "New", desc: "Lead Ingested", time: "10m ago" },
    { id: "contacted", label: "Contacted", desc: "Portfolio Brief", time: "2h ago" },
    { id: "viewing", label: "Viewing", desc: "Site Walkthrough", time: "Yesterday" },
    { id: "negotiation", label: "Negotiation", desc: "Escrow Structuring", time: "Active" },
    { id: "closed", label: "Closed", desc: "Registry Executed", time: "Settled" },
  ];

  const [activePipelineIndex, setActivePipelineIndex] = useState(2);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const interval = setInterval(() => {
      setActivePipelineIndex((prev) => (prev + 1) % pipelineStages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [shouldReduceMotion, pipelineStages.length]);

  // Agent avatars for Team Orchestration
  const executiveAgents = [
    {
      name: "Marcus Sterling",
      role: "Capital Markets Director",
      src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=140&auto=format&fit=crop&q=80",
    },
    {
      name: "Elena Rostova",
      role: "Lead Portfolio Broker",
      src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=140&auto=format&fit=crop&q=80",
    },
    {
      name: "Kabir Mehta",
      role: "Institutional Land Head",
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=140&auto=format&fit=crop&q=80",
    },
    {
      name: "Aria Chen",
      role: "Senior Transaction Advisor",
      src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=140&auto=format&fit=crop&q=80",
    },
    {
      name: "Devon Scott",
      role: "Luxury Assets Associate",
      src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=140&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <section
      id="about"
      ref={containerRef}
      onMouseMove={handleContainerMouseMove}
      className="scroll-mt-20 relative py-20 sm:py-28 lg:py-32 bg-[#07111F] text-[#F5F3ED] overflow-hidden selection:bg-[#D6A85F] selection:text-[#07111F] border-b border-[#D6A85F]/20"
    >
      {/* 1. MOUSE-FOLLOWING SPOTLIGHT (CHAMPAGNE GOLD & MUTED BLUE GLOW) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-700 opacity-60"
        style={{
          background: `radial-gradient(850px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(214,168,95,0.07), rgba(111,155,184,0.04) 45%, transparent 75%)`,
        }}
      />

      {/* 2. ARCHITECTURAL GRID & BLUEPRINT GEOMETRY BACKGROUND */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-80"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px),
            radial-gradient(circle at 85% 15%, rgba(111,155,184,0.06) 0%, transparent 60%),
            radial-gradient(circle at 15% 85%, rgba(214,168,95,0.05) 0%, transparent 65%)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />

      {/* Bloomberg-Style Architectural Grid Telemetry Header */}
      <div className="absolute top-0 left-0 right-0 h-6 border-b border-[#D6A85F]/15 bg-[#0C1929]/60 backdrop-blur-sm flex items-center justify-between px-6 text-[9.5px] font-mono tracking-widest text-[#6F9BB8] select-none pointer-events-none overflow-hidden">
        <div className="flex items-center gap-3">
          <span className="text-[#D6A85F]">SYS // ENTERPRISE CORE v5.2</span>
          <span className="hidden sm:inline text-[#9BA9B8]/40">•</span>
          <span className="hidden sm:inline">18°59&apos;24&quot;N 72°50&apos;02&quot;E [MUMBAI BKC]</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#6FA58A] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6FA58A] animate-pulse" />
            ESCROW LEDGER SYNC: 99.99%
          </span>
          <span className="hidden md:inline text-[#9BA9B8]/60">◄─── 142.8M ARCHITECTURAL ELEVATION ───►</span>
        </div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        {/* ========================================================= */}
        {/* TOP SECTION: ASYMMETRIC TWO-COLUMN COMPOSITION            */}
        {/* Left Side: Real Estate Intelligence (Blue-Hour Hero Card)  */}
        {/* Right Side: Bloomberg-Style Platform Intelligence Cards   */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16 sm:mb-20">
          
          {/* ======================================================= */}
          {/* LEFT SIDE — REAL ESTATE INTELLIGENCE (COLS 1-7)        */}
          {/* ======================================================= */}
          <div className="lg:col-span-7 flex flex-col space-y-7">
            
            {/* Editorial Headline Header */}
            <div>
              {/* Champagne Accent Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#102238] border border-[#D6A85F]/25 mb-4 shadow-[0_2px_12px_rgba(7,17,31,0.5)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D6A85F] animate-pulse" />
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] font-mono font-semibold text-[#D6A85F]">
                  ABOUT THE PLATFORM
                </span>
                <span className="text-[#6F9BB8] text-[10px] font-mono border-l border-[#D6A85F]/20 pl-2">
                  ENTERPRISE REAL ESTATE
                </span>
              </div>

              {/* Large Editorial Headline (Ivory with Champagne Italic Serif) */}
              <motion.h2
                initial={{ opacity: 0, y: 50 }}
                animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-[48px] leading-[1.12] text-[#F5F3ED] tracking-tight font-medium"
              >
                Real Estate, <br className="hidden sm:inline" />
                <span className="font-editorial italic font-normal text-[#D6A85F]">
                  Intelligently Managed.
                </span>
              </motion.h2>

              {/* Supporting Copy with reversible stagger */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 text-sm sm:text-base text-[#9BA9B8] font-normal leading-relaxed max-w-2xl"
              >
                Manage properties, leads, agents, clients, projects and transactions through
                one intelligent real-estate workspace designed for modern property businesses.
              </motion.p>
            </div>

            {/* Left Large Rounded Property Card with Blue-Hour Cinematic Photo */}
            <TiltCard maxTilt={3.5} className="w-full">
              <div className="relative rounded-3xl bg-[#102238] border border-[#D6A85F]/20 p-3 sm:p-4 shadow-[0_25px_60px_rgba(7,17,31,0.8)] overflow-hidden group">
                
                {/* Subtle blueprint grid overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `radial-gradient(circle at 50% 50%, rgba(111,155,184,0.18) 1px, transparent 1px)`,
                      backgroundSize: "24px 24px",
                    }}
                  />
                </div>

                {/* Inner Image Frame: Cinematic Blue-Hour Architecture */}
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/9.5] rounded-2xl overflow-hidden bg-[#0C1929]">
                  {/* Cinematic Image Masked Reveal: scale 1.12 -> 1, blur 8px -> 0, clip-path inset(100% 0 0 0) -> inset(0) */}
                  <motion.img
                    src="/images/about/bluehour-modern-estate.jpg"
                    alt="Cinematic blue hour luxury real estate estate management showcase"
                    initial={{ scale: 1.12, filter: "blur(8px)", clipPath: "inset(100% 0% 0% 0%)" }}
                    animate={
                      sectionInView
                        ? { scale: 1, filter: "blur(0px)", clipPath: "inset(0% 0% 0% 0%)" }
                        : { scale: 1.12, filter: "blur(8px)", clipPath: "inset(100% 0% 0% 0%)" }
                    }
                    transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05]"
                  />

                  {/* Cinematic Deep Navy Gradient Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-[#07111F]/35 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#07111F]/30 via-transparent to-[#07111F]/40 pointer-events-none" />

                  {/* Floating Champagne Particles / Dust Specks */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <span className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-[#D6A85F]/75 animate-ping" />
                    <span className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full bg-[#E8C985]/60 animate-pulse" />
                    <span className="absolute bottom-1/3 left-1/2 w-1 h-1 rounded-full bg-[#6FA58A]/80 animate-pulse" />
                  </div>

                  {/* Top-Left Floating Badge: "Live Portfolio" Status Indicator */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={sectionInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="absolute top-3 sm:top-4 left-3 sm:left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0C1929]/88 backdrop-blur-md border border-[#D6A85F]/25 shadow-lg text-[11px]"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6FA58A] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6FA58A]" />
                    </span>
                    <span className="font-semibold tracking-wider text-[#F5F3ED] uppercase text-[10px]">
                      Live Portfolio
                    </span>
                    <span className="text-[#6F9BB8] font-mono text-[9px] border-l border-[#D6A85F]/20 pl-1.5">
                      99.98% SYNCED
                    </span>
                  </motion.div>

                  {/* Top-Right Floating Badge: Animated Location Marker */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={sectionInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0C1929]/88 backdrop-blur-md border border-[#D6A85F]/25 shadow-lg text-[11px]"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#D6A85F] shrink-0 animate-bounce" />
                    <span className="text-[#F5F3ED] font-medium text-[11px] truncate max-w-[130px] sm:max-w-none">
                      The Crestline • Sky Villa IX
                    </span>
                    <span className="hidden sm:inline text-[#6F9BB8] font-mono text-[9px]">
                      18°59&apos;N
                    </span>
                  </motion.div>

                  {/* Inset Mini Property-Management Dashboard Overlay (Bottom) */}
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={sectionInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.7, delay: 0.5 }}
                      className="rounded-2xl bg-[#142A42]/94 backdrop-blur-xl border border-[#D6A85F]/25 p-3.5 sm:p-5 shadow-[0_15px_40px_rgba(7,17,31,0.7)]"
                    >
                      {/* Telemetry Header */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D6A85F]/15">
                        <div className="flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-[#D6A85F]" />
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F5F3ED]">
                            Real-Estate Intelligence Node
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#6F9BB8] font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6FA58A]" />
                          <span>BLOOMBERG LEDGER ACTIVE</span>
                        </div>
                      </div>

                      {/* 4 Crucial Management Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#D6A85F]/15">
                        
                        {/* 1: 248 Properties */}
                        <div className="pt-1 sm:pt-0 sm:pr-2">
                          <div className="text-[10px] text-[#6F9BB8] uppercase tracking-wider font-semibold">
                            Properties
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-[#F5F3ED] tracking-tight mt-0.5">
                            <CountUpNumber end={248} />
                          </div>
                          <div className="text-[10px] text-[#6FA58A] flex items-center gap-1 mt-0.5 font-medium">
                            <span>+12 this month</span>
                          </div>
                        </div>

                        {/* 2: 36 Active Listings */}
                        <div className="pt-2 sm:pt-0 sm:px-2">
                          <div className="text-[10px] text-[#6F9BB8] uppercase tracking-wider font-semibold">
                            Active Listings
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-[#F5F3ED] tracking-tight mt-0.5">
                            <CountUpNumber end={36} />
                          </div>
                          <div className="text-[10px] text-[#D6A85F] flex items-center gap-1 mt-0.5 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D6A85F]" />
                            <span>Prime Allocation</span>
                          </div>
                        </div>

                        {/* 3: 124 Leads */}
                        <div className="pt-2 sm:pt-0 sm:px-2">
                          <div className="text-[10px] text-[#6F9BB8] uppercase tracking-wider font-semibold">
                            Active Leads
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-[#F5F3ED] tracking-tight mt-0.5">
                            <CountUpNumber end={124} />
                          </div>
                          <div className="text-[10px] text-[#6FA58A] flex items-center gap-1 mt-0.5 font-medium">
                            <span>84% Qualified</span>
                          </div>
                        </div>

                        {/* 4: ₹8.4Cr Portfolio Value (Champagne Gold Highlight) */}
                        <div className="pt-2 sm:pt-0 sm:pl-2">
                          <div className="text-[10px] text-[#6F9BB8] uppercase tracking-wider font-semibold">
                            Portfolio Value
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-[#D6A85F] tracking-tight mt-0.5">
                            ₹8.4Cr
                          </div>
                          <div className="text-[10px] text-[#9BA9B8] flex items-center gap-1 mt-0.5 font-mono">
                            <span>Target +24%</span>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Sub-Card Data Strip: Enterprise Walkthrough Action */}
                <div className="mt-3 px-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#9BA9B8]">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-[#6F9BB8]">
                    <span>MULTI-TENANT ESCROW</span>
                    <span>•</span>
                    <span className="text-[#9BA9B8]">RERA REGISTRY COMPLIANT</span>
                  </div>

                  <button
                    onClick={() => onOpenEnquiry && onOpenEnquiry("Enterprise Real Estate Software Demo")}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#D6A85F] hover:text-[#E8C985] transition-colors group/btn cursor-pointer"
                  >
                    <span>Request Executive Walkthrough</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </button>
                </div>
              </div>
            </TiltCard>
          </div>

          {/* ======================================================= */}
          {/* RIGHT SIDE — PLATFORM INTELLIGENCE (COLS 8-12)          */}
          {/* Sophisticated Deep Navy Management Cards                */}
          {/* ======================================================= */}
          <div className="lg:col-span-5 flex flex-col space-y-4 pt-1 sm:pt-2">
            
            {/* Bloomberg-Style Module Header */}
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#6F9BB8] font-semibold">
                PLATFORM CAPABILITIES
              </span>
              <span className="text-[10px] font-mono text-[#D6A85F] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D6A85F]" />
                AUTONOMOUS CRM SYNC
              </span>
            </div>

            {/* CARD 1 — PORTFOLIO (248+ PROPERTIES MANAGED) */}
            <TiltCard maxTilt={4}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-2xl bg-[#102238] border border-[#D6A85F]/20 p-5 sm:p-6 shadow-[0_10px_35px_rgba(7,17,31,0.5)] overflow-hidden hover:border-[#D6A85F]/40 transition-colors"
              >
                {/* Blueprint Geometry Overlay */}
                <ArchitecturalBlueprint />

                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 rounded-lg bg-[#142A42] border border-[#D6A85F]/25 text-[#D6A85F]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-semibold text-[#6F9BB8]">
                        PORTFOLIO ENGINE
                      </span>
                    </div>

                    <div className="text-3xl sm:text-4xl font-serif font-medium text-[#F5F3ED] tracking-tight leading-none">
                      <CountUpNumber end={248} suffix="+" />
                    </div>
                    <div className="text-sm font-semibold text-[#F5F3ED] mt-1">
                      Properties Managed
                    </div>
                    <p className="text-xs text-[#9BA9B8] mt-1 max-w-[260px] leading-relaxed">
                      Residential, commercial &amp; development portfolios with live multi-currency ledgers.
                    </p>
                  </div>

                  {/* Miniature Architectural Elevation / Building Visualization */}
                  <div className="shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#0C1929] border border-[#D6A85F]/20 p-2 flex flex-col justify-between shadow-inner">
                    <div className="flex items-center justify-between text-[9px] font-mono text-[#6F9BB8]">
                      <span>ELEVATION</span>
                      <span className="text-[#6FA58A]">94% OCC</span>
                    </div>

                    {/* Vector CAD Building Visualization */}
                    <svg viewBox="0 0 100 70" className="w-full h-14 stroke-[#6F9BB8]">
                      {/* Base podium */}
                      <rect x="15" y="48" width="70" height="18" fill="#142A42" strokeWidth="1" />
                      {/* Tower core */}
                      <rect x="25" y="10" width="50" height="38" fill="#102238" strokeWidth="1" />
                      {/* Penthouse level */}
                      <rect x="35" y="4" width="30" height="6" fill="#142A42" strokeWidth="0.8" stroke="#D6A85F" />
                      {/* Floor levels */}
                      <line x1="25" y1="20" x2="75" y2="20" strokeWidth="0.8" strokeDasharray="1 1" />
                      <line x1="25" y1="29" x2="75" y2="29" strokeWidth="0.8" strokeDasharray="1 1" />
                      <line x1="25" y1="38" x2="75" y2="38" strokeWidth="0.8" strokeDasharray="1 1" />
                      {/* Live Unit Beacons (Champagne & Muted Blue) */}
                      <circle cx="35" cy="24" r="1.5" fill="#D6A85F" />
                      <circle cx="50" cy="24" r="1.5" fill="#6FA58A" />
                      <circle cx="65" cy="24" r="1.5" fill="#6F9BB8" />
                      <circle cx="35" cy="33" r="1.5" fill="#6F9BB8" />
                      <circle cx="50" cy="33" r="1.5" fill="#D6A85F" />
                      <circle cx="65" cy="33" r="1.5" fill="#6FA58A" />
                    </svg>

                    <div className="flex justify-between text-[8px] font-mono text-[#9BA9B8]">
                      <span>RES: 58%</span>
                      <span>COM: 42%</span>
                    </div>
                  </div>
                </div>

                {/* Micro Distribution Bar */}
                <div className="relative z-10 mt-4 pt-3 border-t border-[#D6A85F]/15">
                  <div className="flex items-center justify-between text-[10px] text-[#9BA9B8] mb-1.5 font-mono">
                    <span>Portfolio Distribution</span>
                    <span className="text-[#D6A85F]">100% RERA Verified</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#0C1929] rounded-full overflow-hidden flex">
                    <div className="h-full bg-[#D6A85F] w-[58%]" title="Residential 58%" />
                    <div className="h-full bg-[#6F9BB8] w-[27%]" title="Commercial 27%" />
                    <div className="h-full bg-[#6FA58A] w-[15%]" title="Development 15%" />
                  </div>
                </div>
              </motion.div>
            </TiltCard>

            {/* CARD 2 — LEAD PIPELINE (HORIZONTAL PIPELINE WITH ANIMATED LEAD MOVEMENT) */}
            <TiltCard maxTilt={4}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-2xl bg-[#102238] border border-[#D6A85F]/20 p-5 sm:p-6 shadow-[0_10px_35px_rgba(7,17,31,0.5)] overflow-hidden hover:border-[#D6A85F]/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#142A42] border border-[#D6A85F]/25 text-[#D6A85F]">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-semibold text-[#6F9BB8] block">
                        INTELLIGENT PIPELINE
                      </span>
                      <span className="text-sm font-semibold text-[#F5F3ED]">
                        Lead Conversion Matrix
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-[#D6A85F] px-2 py-0.5 rounded-md bg-[#142A42] border border-[#D6A85F]/20">
                    STAGE {activePipelineIndex + 1}/5
                  </span>
                </div>

                {/* Horizontal Pipeline Steps */}
                <div className="relative mt-4">
                  {/* Connecting track line */}
                  <div className="absolute top-3.5 left-3 right-3 h-[2px] bg-[#0C1929] -z-0" />
                  <div
                    className="absolute top-3.5 left-3 h-[2px] bg-[#D6A85F] transition-all duration-700 ease-out -z-0"
                    style={{
                      width: `${(activePipelineIndex / (pipelineStages.length - 1)) * 100}%`,
                    }}
                  />

                  {/* 5 Stages Grid */}
                  <div className="grid grid-cols-5 gap-1 relative z-10">
                    {pipelineStages.map((stage, idx) => {
                      const isActive = idx === activePipelineIndex;
                      const isPast = idx < activePipelineIndex;
                      return (
                        <div
                          key={stage.id}
                          className="flex flex-col items-center text-center cursor-pointer"
                          onClick={() => setActivePipelineIndex(idx)}
                        >
                          {/* Step circle */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold font-mono transition-all duration-300 ${
                              isActive
                                ? "bg-[#D6A85F] text-[#07111F] ring-4 ring-[#D6A85F]/25 scale-110 shadow-[0_0_15px_rgba(214,168,95,0.6)]"
                                : isPast
                                ? "bg-[#6FA58A] text-[#07111F]"
                                : "bg-[#0C1929] text-[#6F9BB8] border border-[#D6A85F]/20"
                            }`}
                          >
                            {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                          </div>

                          <span
                            className={`text-[10px] mt-1.5 font-medium transition-colors ${
                              isActive ? "text-[#D6A85F] font-bold" : "text-[#9BA9B8]"
                            }`}
                          >
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Animated Lead Moving Through The Pipeline */}
                <div className="mt-4 p-3 rounded-xl bg-[#0C1929] border border-[#D6A85F]/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-[#D6A85F] animate-ping shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-[#F5F3ED] truncate">
                        Lead #L-8041: Dr. Aryan Varma
                      </div>
                      <div className="text-[10px] text-[#6F9BB8] truncate">
                        Interested in: <span className="text-[#D6A85F]">The Crestline IX (₹4.2Cr)</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#142A42] text-[#6FA58A] border border-[#6FA58A]/30">
                      → {pipelineStages[activePipelineIndex].desc}
                    </span>
                  </div>
                </div>
              </motion.div>
            </TiltCard>

            {/* CARD 3 & 4 IN SPLIT GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* CARD 3 — PERFORMANCE (PROGRESSIVE LINE CHART) */}
              <TiltCard maxTilt={4}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={sectionInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="rounded-2xl bg-[#102238] border border-[#D6A85F]/20 p-4 sm:p-5 shadow-[0_10px_35px_rgba(7,17,31,0.5)] flex flex-col justify-between h-full hover:border-[#D6A85F]/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-semibold text-[#6F9BB8]">
                        PERFORMANCE
                      </span>
                      <div className="p-1 rounded bg-[#142A42] border border-[#D6A85F]/25 text-[#D6A85F]">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-bold text-[#D6A85F] tracking-tight">
                        +24.8%
                      </span>
                      <span className="text-[10px] text-[#6F9BB8] font-mono">QoQ</span>
                    </div>
                    <div className="text-xs font-semibold text-[#F5F3ED] mt-0.5">
                      Revenue Growth
                    </div>
                  </div>

                  {/* Progressive Animated Line Chart in Muted Blue / Champagne */}
                  <div className="mt-4 pt-2">
                    <div className="h-16 w-full relative">
                      <svg viewBox="0 0 160 60" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="navyChartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#D6A85F" stopOpacity="0.32" />
                            <stop offset="100%" stopColor="#D6A85F" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Shaded Area Below Line */}
                        <motion.polygon
                          points="0,55 0,46 35,42 70,30 110,22 160,8 160,55"
                          fill="url(#navyChartGradient)"
                          initial={{ opacity: 0 }}
                          animate={sectionInView ? { opacity: 1 } : { opacity: 0 }}
                          transition={{ duration: 0.8, delay: 0.6 }}
                        />

                        {/* Animated Drawing Path */}
                        <motion.path
                          d="M 0,46 Q 20,44 35,42 T 70,30 T 110,22 T 160,8"
                          fill="none"
                          stroke="#D6A85F"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={sectionInView ? { pathLength: 1 } : { pathLength: 0 }}
                          transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
                        />

                        {/* End Point Glow Beacon */}
                        <circle cx="160" cy="8" r="4" fill="#E8C985" />
                        <circle cx="160" cy="8" r="7" fill="#D6A85F" opacity="0.35" className="animate-ping" />
                      </svg>
                    </div>

                    <div className="flex justify-between items-center text-[9px] font-mono text-[#6F9BB8] mt-1 pt-1 border-t border-[#D6A85F]/15">
                      <span>Q1: ₹18.2Cr</span>
                      <span>Q2</span>
                      <span>Q3</span>
                      <span className="text-[#D6A85F] font-semibold">Q4: ₹39.7Cr</span>
                    </div>
                  </div>
                </motion.div>
              </TiltCard>

              {/* CARD 4 — TEAM ORCHESTRATION (48 ACTIVE AGENTS) */}
              <TiltCard maxTilt={4}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                  transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl bg-[#102238] border border-[#D6A85F]/20 p-4 sm:p-5 shadow-[0_10px_35px_rgba(7,17,31,0.5)] flex flex-col justify-between h-full hover:border-[#D6A85F]/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-mono font-semibold text-[#6F9BB8]">
                        TEAM ORCHESTRATION
                      </span>
                      <div className="p-1 rounded bg-[#142A42] border border-[#D6A85F]/25 text-[#D6A85F]">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-bold text-[#F5F3ED] tracking-tight">
                        <CountUpNumber end={48} />
                      </span>
                      {/* Online Presence Beacon */}
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#6FA58A]/15 border border-[#6FA58A]/30 text-[9px] text-[#6FA58A] font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6FA58A] animate-pulse" />
                        38 Online
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-[#F5F3ED] mt-0.5">
                      Active Agents
                    </div>
                  </div>

                  {/* Overlapping Agent Avatars Row */}
                  <div className="mt-4 pt-2 border-t border-[#D6A85F]/15">
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2.5 overflow-hidden py-1">
                        {executiveAgents.map((agent, i) => (
                          <img
                            key={i}
                            src={agent.src}
                            alt={agent.name}
                            title={`${agent.name} • ${agent.role}`}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-[#102238] object-cover hover:scale-110 hover:z-20 transition-transform cursor-pointer"
                          />
                        ))}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-[#D6A85F] block font-semibold">
                          ₹32.4Cr
                        </span>
                        <span className="text-[9px] text-[#6F9BB8] block">
                          Closed Q4
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-[10px] text-[#9BA9B8] flex items-center justify-between font-mono">
                      <span>Deal Velocity</span>
                      <span className="text-[#6FA58A]">14 Days Avg</span>
                    </div>
                  </div>
                </motion.div>
              </TiltCard>

            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM STATISTICS STRIP                                   */}
        {/* Deep Navy Container Spanning Section with Dividers        */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl border border-[#D6A85F]/25 bg-gradient-to-r from-[#102238] via-[#142A42] to-[#102238] p-6 sm:p-8 lg:p-10 shadow-[0_25px_60px_rgba(7,17,31,0.8)] backdrop-blur-md"
        >
          {/* Subtle blueprint line pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(214,168,95,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(214,168,95,0.2) 1px, transparent 1px)`,
                backgroundSize: "36px 36px",
              }}
            />
          </div>

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-[#D6A85F]/15">
            
            {/* 1. 2,500+ Properties Managed */}
            <div className="flex flex-col justify-between pt-2 md:pt-0 md:pr-4">
              <div className="flex items-center gap-2 mb-2 text-[#D6A85F]">
                <Building2 className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#6F9BB8]">
                  PORTFOLIO
                </span>
              </div>
              <div className="font-editorial text-3xl sm:text-4xl lg:text-[40px] font-normal text-[#F5F3ED] tracking-tight leading-none">
                <CountUpNumber end={2500} suffix="+" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#F5F3ED] mt-2 mb-0.5">
                Properties Managed
              </div>
              <p className="text-[11px] text-[#9BA9B8] leading-tight">
                Institutional &amp; private residential units
              </p>
            </div>

            {/* 2. 850+ Active Clients */}
            <div className="flex flex-col justify-between pt-4 md:pt-0 md:px-4">
              <div className="flex items-center gap-2 mb-2 text-[#D6A85F]">
                <Users className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#6F9BB8]">
                  CLIENT BASE
                </span>
              </div>
              <div className="font-editorial text-3xl sm:text-4xl lg:text-[40px] font-normal text-[#F5F3ED] tracking-tight leading-none">
                <CountUpNumber end={850} suffix="+" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#F5F3ED] mt-2 mb-0.5">
                Active Clients
              </div>
              <p className="text-[11px] text-[#9BA9B8] leading-tight">
                Developers, funds &amp; family offices
              </p>
            </div>

            {/* 3. 120+ Real Estate Agents */}
            <div className="flex flex-col justify-between pt-4 md:pt-0 md:px-4">
              <div className="flex items-center gap-2 mb-2 text-[#D6A85F]">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#6F9BB8]">
                  BROKER NETWORK
                </span>
              </div>
              <div className="font-editorial text-3xl sm:text-4xl lg:text-[40px] font-normal text-[#F5F3ED] tracking-tight leading-none">
                <CountUpNumber end={120} suffix="+" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#F5F3ED] mt-2 mb-0.5">
                Real Estate Agents
              </div>
              <p className="text-[11px] text-[#9BA9B8] leading-tight">
                Top-tier certified regional specialists
              </p>
            </div>

            {/* 4. 98.6% Client Satisfaction (Champagne Gold Highlight) */}
            <div className="flex flex-col justify-between pt-4 md:pt-0 md:px-4">
              <div className="flex items-center gap-2 mb-2 text-[#6FA58A]">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#6FA58A]">
                  TRUST INDEX
                </span>
              </div>
              <div className="font-editorial text-3xl sm:text-4xl lg:text-[40px] font-normal text-[#6FA58A] tracking-tight leading-none">
                <CountUpNumber end={98.6} decimals={1} suffix="%" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#F5F3ED] mt-2 mb-0.5">
                Client Satisfaction
              </div>
              <p className="text-[11px] text-[#9BA9B8] leading-tight">
                Verified transactional NPS score
              </p>
            </div>

            {/* 5. ₹120Cr+ Portfolio Value (Champagne Gold Highlight) */}
            <div className="flex flex-col justify-between pt-4 md:pt-0 md:pl-4 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-2 text-[#D6A85F]">
                <TrendingUp className="w-4 h-4" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-[#D6A85F]">
                  GROSS ASSETS
                </span>
              </div>
              <div className="font-editorial text-3xl sm:text-4xl lg:text-[40px] font-normal text-[#D6A85F] tracking-tight leading-none">
                ₹120Cr+
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#F5F3ED] mt-2 mb-0.5">
                Portfolio Value
              </div>
              <p className="text-[11px] text-[#9BA9B8] leading-tight">
                Total transacted asset capitalization
              </p>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}

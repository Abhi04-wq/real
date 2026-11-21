import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useScrollDirection } from "../../hooks/useScrollDirection";
import {
  ArrowRight,
  Building2,
  Calendar,
  Compass,
  MapPin,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

// Architectural Digital City Route & Masterplan SVG with bidirectional path drawing
const CtaArchitecturalGrid = ({ normX = 0, normY = 0, inView = true }) => (
  <svg
    viewBox="0 0 1200 600"
    fill="none"
    className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-[0.09] transition-transform duration-700 ease-out"
    style={{
      transform: `translate(${normX * 12}px, ${normY * 12}px)`,
    }}
  >
    {/* Geometric Grid */}
    {Array.from({ length: 13 }).map((_, i) => (
      <line key={`gx-${i}`} x1={i * 100} y1="0" x2={i * 100} y2="600" stroke="#6F9BB8" strokeWidth="0.8" strokeDasharray="6 6" />
    ))}
    {Array.from({ length: 7 }).map((_, j) => (
      <line key={`gy-${j}`} x1="0" y1={j * 100} x2="1200" y2={j * 100} stroke="#6F9BB8" strokeWidth="0.8" strokeDasharray="6 6" />
    ))}
    {/* Connecting Arterial Transit Corridors - Bidirectional draw */}
    <motion.path
      d="M 150 480 C 400 350, 700 450, 1050 150"
      stroke="#D6A85F"
      strokeWidth="1.5"
      strokeDasharray="8 6"
      initial={{ pathLength: 0 }}
      animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
      transition={{ duration: 1.4, ease: "easeOut" }}
    />
    <motion.path
      d="M 250 120 C 500 280, 800 220, 1100 500"
      stroke="#6F9BB8"
      strokeWidth="1.2"
      strokeDasharray="6 4"
      initial={{ pathLength: 0 }}
      animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
      transition={{ duration: 1.6, ease: "easeOut" }}
    />
    {/* City Cluster Markers */}
    <g transform="translate(250, 120)">
      <circle r="4" fill="#D6A85F" />
      <circle r="9" stroke="#D6A85F" strokeWidth="0.8" strokeDasharray="2 2" className="animate-spin" />
      <text x="14" y="4" fill="#6F9BB8" fontSize="10" fontFamily="monospace">KOLKATA // 22°34&apos;N</text>
    </g>
    <g transform="translate(500, 280)">
      <circle r="4" fill="#6FA58A" />
      <text x="14" y="4" fill="#6F9BB8" fontSize="10" fontFamily="monospace">MUMBAI // 18°59&apos;N</text>
    </g>
    <g transform="translate(800, 220)">
      <circle r="4" fill="#D6A85F" />
      <text x="14" y="4" fill="#6F9BB8" fontSize="10" fontFamily="monospace">DELHI // 28°36&apos;N</text>
    </g>
    <g transform="translate(1050, 150)">
      <circle r="4" fill="#6FA58A" />
      <text x="14" y="4" fill="#6F9BB8" fontSize="10" fontFamily="monospace">BANGALORE // 12°58&apos;N</text>
    </g>
  </svg>
);

export default function EditorialCTA({ onOpenEnquiry }) {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.15 });
  const shouldReduceMotion = useReducedMotion();
  const { scrollDirection } = useScrollDirection();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const ctaParallaxY = useTransform(scrollYProgress, [0, 1], [-25, 25]);

  // Mouse Parallax & Spotlight Coordinates
  const [mousePos, setMousePos] = useState({ x: 600, y: 350, normX: 0, normY: 0 });

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;
    setMousePos({ x, y, normX, normY });
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="scroll-mt-20 relative py-24 sm:py-32 lg:py-36 bg-[#07111F] text-[#F5F3ED] overflow-hidden selection:bg-[#D6A85F] selection:text-[#07111F] border-b border-[#D6A85F]/20"
    >
      {/* 1. SOFT CURSOR-FOLLOWING SPOTLIGHT */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-700 opacity-60"
        style={{
          background: `radial-gradient(900px circle at ${mousePos.x}px ${mousePos.y}px, rgba(214,168,95,0.07), rgba(111,155,184,0.04) 45%, transparent 75%)`,
        }}
      />

      {/* 2. DUAL AMBIENT RADIAL GLOWS (CHAMPAGNE ON LEFT, MUTED BLUE ON RIGHT) */}
      <div className="pointer-events-none absolute top-1/3 left-10 w-96 h-96 bg-[#D6A85F]/6 rounded-full blur-[100px] -z-10" />
      <div className="pointer-events-none absolute bottom-1/4 right-10 w-[450px] h-[450px] bg-[#6F9BB8]/6 rounded-full blur-[110px] -z-10" />

      {/* 3. SUBTLE ARCHITECTURAL MASTERPLAN LINES & CITY NODES */}
      <CtaArchitecturalGrid normX={mousePos.normX} normY={mousePos.normY} inView={inView} />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================= */}
        {/* CENTERPIECE: PROPERTY INTELLIGENCE GATEWAY CONTAINER      */}
        {/* Layered 3D Perspective Container with Floating Modules    */}
        {/* ========================================================= */}
        <div className="relative max-w-5xl mx-auto mb-16">
          
          {/* FLOATING DATA MODULE 1 (TOP-LEFT): 248 PROPERTIES */}
          <motion.div
            initial={{ opacity: 0, y: -20, x: -20 }}
            animate={inView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: -20, x: -20 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              transform: shouldReduceMotion
                ? "none"
                : `translate(${mousePos.normX * -8}px, ${mousePos.normY * -8}px)`,
            }}
            className="hidden lg:flex absolute -top-8 -left-12 z-30 flex-col p-3.5 rounded-2xl bg-[#0B1727]/92 backdrop-blur-xl border border-[#D6A85F]/30 shadow-[0_15px_35px_rgba(7,17,31,0.8)]"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A85F] animate-pulse" />
              <span className="text-[9.5px] font-mono uppercase text-[#6F9BB8]">PORTFOLIO CORE</span>
            </div>
            <div className="text-xl font-bold font-mono text-[#F5F3ED]">
              <CountUpNumber end={248} suffix="+" />
            </div>
            <span className="text-[10px] text-[#9BA9B8]">Properties Managed</span>
          </motion.div>

          {/* FLOATING DATA MODULE 2 (TOP-RIGHT): 124 ACTIVE LEADS */}
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={inView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: -20, x: 20 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              transform: shouldReduceMotion
                ? "none"
                : `translate(${mousePos.normX * 8}px, ${mousePos.normY * -8}px)`,
            }}
            className="hidden lg:flex absolute -top-6 -right-10 z-30 flex-col p-3.5 rounded-2xl bg-[#0B1727]/92 backdrop-blur-xl border border-[#D6A85F]/30 shadow-[0_15px_35px_rgba(7,17,31,0.8)]"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6FA58A]" />
              <span className="text-[9.5px] font-mono uppercase text-[#6FA58A]">CRM TELEMETRY</span>
            </div>
            <div className="text-xl font-bold font-mono text-[#D6A85F]">
              <CountUpNumber end={124} />
            </div>
            <span className="text-[10px] text-[#9BA9B8]">Active Leads Live</span>
          </motion.div>

          {/* FLOATING DATA MODULE 3 (BOTTOM-LEFT): ₹8.4Cr PORTFOLIO VALUE */}
          <motion.div
            initial={{ opacity: 0, y: 20, x: -20 }}
            animate={inView ? { opacity: 1, y: 0, x: 0 } : { opacity: 0, y: 20, x: -20 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{
              transform: shouldReduceMotion
                ? "none"
                : `translate(${mousePos.normX * -10}px, ${mousePos.normY * 10}px)`,
            }}
            className="hidden lg:flex absolute -bottom-6 -left-10 z-30 flex-col p-3.5 rounded-2xl bg-[#0B1727]/92 backdrop-blur-xl border border-[#D6A85F]/30 shadow-[0_15px_35px_rgba(7,17,31,0.8)]"
          >
            <div className="text-[9.5px] font-mono uppercase text-[#6F9BB8] mb-0.5">CAPITALIZATION</div>
            <div className="text-xl font-bold font-mono text-[#D6A85F]">
              ₹8.4Cr
            </div>
            <span className="text-[10px] text-[#6FA58A] flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +24.8% YoY
            </span>
          </motion.div>

          {/* FLOATING PROPERTY CARD PREVIEW (BOTTOM-RIGHT OVERLAPPING): SKYLINE RESIDENCE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.9, y: 30 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              transform: shouldReduceMotion
                ? "none"
                : `translate(${mousePos.normX * 10}px, ${mousePos.normY * 10}px)`,
            }}
            className="hidden md:flex absolute -bottom-10 -right-8 z-30 w-60 flex-col rounded-2xl bg-[#0C1929] border border-[#D6A85F]/35 shadow-[0_20px_45px_rgba(7,17,31,0.9)] overflow-hidden"
          >
            <div className="relative h-24 w-full bg-[#102238] overflow-hidden">
              <img
                src="/images/about/bluehour-modern-estate.jpg"
                alt="Skyline Residence preview"
                className="w-full h-full object-cover filter brightness-95"
              />
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#07111F]/80 text-[8.5px] font-mono text-[#D6A85F] border border-[#D6A85F]/25">
                ACTIVE LISTING
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between text-[9px] font-mono text-[#6F9BB8]">
                <span>Kolkata Prime</span>
                <span className="flex items-center gap-1 text-[#6FA58A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6FA58A]" /> Available
                </span>
              </div>
              <h5 className="font-editorial text-sm font-semibold text-[#F5F3ED] mt-0.5 truncate">
                Skyline Residence
              </h5>
              <div className="text-xs font-bold font-mono text-[#D6A85F] mt-1">
                ₹2.85 Cr
              </div>
            </div>
          </motion.div>

          {/* ======================================================= */}
          {/* MAIN LAYERED CTA PANEL                                  */}
          {/* Container rises, scales 0.94 -> 1, blur 10px -> 0        */}
          {/* ======================================================= */}
          <motion.div
            initial={{ opacity: 0, y: 70, scale: 0.94, filter: "blur(10px)" }}
            animate={
              inView
                ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
                : { opacity: 0, y: 70, scale: 0.94, filter: "blur(10px)" }
            }
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            style={{
              transform: shouldReduceMotion
                ? "none"
                : `perspective(1000px) rotateX(${mousePos.normY * -1.2}deg) rotateY(${mousePos.normX * 1.2}deg)`,
              transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
            className="relative rounded-[26px] bg-[#102238] border border-[#D6A85F]/30 p-2 sm:p-3 shadow-[0_30px_90px_rgba(7,17,31,0.95)] overflow-hidden"
          >
            {/* Outer Subtle Gold Rim Light */}
            <div className="absolute inset-0 pointer-events-none rounded-[26px] border border-[#D6A85F]/20" />

            {/* Inner Architectural Grid Layer */}
            <div className="relative rounded-[20px] bg-[#0C1929]/95 backdrop-blur-md px-6 sm:px-14 lg:px-20 py-16 sm:py-20 lg:py-24 text-center overflow-hidden border border-[#D6A85F]/15">
              
              {/* Internal Grid Lines */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, rgba(214,168,95,0.15) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(214,168,95,0.15) 1px, transparent 1px)
                  `,
                  backgroundSize: "44px 44px",
                }}
              />

              {/* Plaque Content */}
              <div className="relative z-10 max-w-2xl mx-auto">
                
                {/* 5. TOP LABEL PILL */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#142A42] border border-[#D6A85F]/35 shadow-md mb-6"
                >
                  <span className="w-2 h-2 rounded-full bg-[#D6A85F] animate-pulse" />
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.26em] font-mono font-semibold text-[#D6A85F]">
                    PROPERTY INTELLIGENCE GATEWAY
                  </span>
                </motion.div>

                {/* 6. MAIN EDITORIAL HEADLINE */}
                <motion.h2
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="font-editorial text-3xl sm:text-5xl md:text-6xl text-[#F5F3ED] leading-[1.12] tracking-tight font-normal"
                >
                  Find Your Next Property. <br />
                  <span className="italic font-normal text-[#D6A85F]">
                    Manage Your Entire Portfolio.
                  </span>
                </motion.h2>

                {/* 7. SUPPORTING TEXT */}
                <motion.p
                  initial={{ opacity: 0, y: 25 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
                  transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-5 text-sm sm:text-base md:text-[16.5px] text-[#9BA9B8] font-normal leading-relaxed max-w-xl mx-auto"
                >
                  Discover properties, manage clients, track opportunities and make smarter
                  real-estate decisions from one intelligent platform.
                </motion.p>

                {/* 8. CTA BUTTONS (PRIMARY + SECONDARY) */}
                <motion.div
                  initial={{ opacity: 0, y: 25 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
                  transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  {/* Primary CTA */}
                  <button
                    onClick={() => navigate("/properties")}
                    className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#07111F] border border-[#D6A85F]/50 text-xs sm:text-sm font-semibold tracking-wider text-[#F5F3ED] hover:text-[#07111F] transition-all duration-300 shadow-[0_4px_25px_rgba(214,168,95,0.25)] cursor-pointer overflow-hidden"
                  >
                    {/* Gold Background Sweep on Hover */}
                    <span className="absolute inset-0 bg-[#D6A85F] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out -z-0" />
                    <span className="relative z-10 font-bold uppercase tracking-wider">
                      EXPLORE PROPERTIES
                    </span>
                    <ArrowRight className="relative z-10 w-4 h-4 text-[#D6A85F] group-hover:text-[#07111F] transition-transform duration-300 group-hover:translate-x-1.5" />
                  </button>

                  {/* Secondary CTA */}
                  <button
                    onClick={() => onOpenEnquiry && onOpenEnquiry("Enterprise Platform Demonstration")}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#142A42]/60 hover:bg-[#142A42] border border-[#D6A85F]/25 hover:border-[#D6A85F]/50 text-xs sm:text-sm font-semibold tracking-wider text-[#F5F3ED] hover:text-[#D6A85F] transition-all duration-300 cursor-pointer shadow-sm"
                  >
                    <Calendar className="w-4 h-4 text-[#D6A85F]" />
                    <span className="uppercase tracking-wider">BOOK A DEMO</span>
                  </button>
                </motion.div>

              </div>

            </div>

          </motion.div>

        </div>

        {/* ========================================================= */}
        {/* 19. BOTTOM TRUST STRIP                                    */}
        {/* Understated Metrics Spanning Beneath the CTA              */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="pt-8 border-t border-[#D6A85F]/15 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-mono text-[#9BA9B8]"
        >
          <div className="flex items-center gap-2">
            <span className="text-[#F5F3ED] font-bold">
              <CountUpNumber end={2500} suffix="+" />
            </span>
            <span className="text-[#6F9BB8]">PROPERTIES MANAGED</span>
          </div>

          <span className="text-[#D6A85F]/30 hidden sm:inline">•</span>

          <div className="flex items-center gap-2">
            <span className="text-[#D6A85F] font-bold">
              <CountUpNumber end={850} suffix="+" />
            </span>
            <span className="text-[#6F9BB8]">ACTIVE CLIENTS</span>
          </div>

          <span className="text-[#D6A85F]/30 hidden sm:inline">•</span>

          <div className="flex items-center gap-2">
            <span className="text-[#F5F3ED] font-bold">
              <CountUpNumber end={120} suffix="+" />
            </span>
            <span className="text-[#6F9BB8]">REAL ESTATE TEAMS</span>
          </div>

          <span className="text-[#D6A85F]/30 hidden sm:inline">•</span>

          <div className="flex items-center gap-2">
            <span className="text-[#6FA58A] font-bold">
              <CountUpNumber end={98.6} decimals={1} suffix="%" />
            </span>
            <span className="text-[#6FA58A]">SATISFACTION</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

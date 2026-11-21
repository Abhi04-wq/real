import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
  Maximize2,
  Search,
  Filter,
  DollarSign,
  Briefcase,
  Sparkles,
  Navigation,
  Globe,
  Sliders,
  Eye,
  Radio,
} from "lucide-react";

// Architectural Floor-plan & City Masterplan Vector Background
const CityMasterplanGrid = ({ parallaxX = 0, parallaxY = 0 }) => (
  <svg
    viewBox="0 0 1200 800"
    fill="none"
    className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.18] select-none transition-transform duration-700 ease-out"
    style={{
      transform: `translate(${parallaxX * 0.4}px, ${parallaxY * 0.4}px)`,
    }}
  >
    <defs>
      <pattern id="masterplanPattern" width="120" height="120" patternUnits="userSpaceOnUse">
        <rect width="120" height="120" fill="none" stroke="rgba(111,155,184,0.18)" strokeWidth="0.75" />
        <rect x="15" y="15" width="40" height="40" fill="none" stroke="rgba(214,168,95,0.22)" strokeWidth="0.8" />
        <rect x="65" y="15" width="40" height="25" fill="none" stroke="rgba(111,155,184,0.25)" strokeWidth="0.6" strokeDasharray="2 2" />
        <rect x="65" y="48" width="40" height="57" fill="none" stroke="rgba(111,155,184,0.25)" strokeWidth="0.6" strokeDasharray="2 2" />
        <rect x="15" y="65" width="40" height="40" fill="none" stroke="rgba(111,155,184,0.25)" strokeWidth="0.6" />
        {/* Street routes */}
        <line x1="0" y1="60" x2="120" y2="60" stroke="rgba(214,168,95,0.3)" strokeWidth="1" strokeDasharray="6 4" />
        <line x1="60" y1="0" x2="60" y2="120" stroke="rgba(214,168,95,0.3)" strokeWidth="1" strokeDasharray="6 4" />
        {/* CAD crosshairs */}
        <path d="M 57 60 L 63 60 M 60 57 L 60 63" stroke="#D6A85F" strokeWidth="0.75" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#masterplanPattern)" />
    {/* Major transit artery corridor */}
    <path
      d="M -100 200 C 300 220, 600 150, 1300 350"
      stroke="#D6A85F"
      strokeWidth="1.5"
      strokeDasharray="8 6"
      opacity="0.35"
    />
    <path
      d="M 200 0 C 350 400, 700 500, 1000 900"
      stroke="#6F9BB8"
      strokeWidth="1.5"
      strokeDasharray="6 6"
      opacity="0.3"
    />
    {/* Micro coordinate markers */}
    <text x="180" y="240" fill="#6F9BB8" fontSize="9" fontFamily="monospace" letterSpacing="1">
      LOT-42B // BKC FINANCIAL PLAZA
    </text>
    <text x="750" y="320" fill="#D6A85F" fontSize="9" fontFamily="monospace" letterSpacing="1">
      COASTAL ARTERY // SECTOR 18
    </text>
    <text x="920" y="640" fill="#6F9BB8" fontSize="9" fontFamily="monospace" letterSpacing="1">
      TERMINAL HUB // 18°59&apos;N 72°50&apos;E
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

// 3D Tilt Card with Sheen
function TiltCard({ children, className = "", maxTilt = 4, ...props }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
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
        transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
      className={`will-change-transform ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default function WhyChooseUs() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.15 });
  const shouldReduceMotion = useReducedMotion();
  const { scrollDirection } = useScrollDirection();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const masterplanParallaxY = useTransform(scrollYProgress, [0, 1], [-25, 25]);

  // Mouse parallax and spotlight coordinates
  const [mousePos, setMousePos] = useState({ x: 600, y: 350, normX: 0, normY: 0 });

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const normX = (x / rect.width - 0.5) * 2; // -1 to 1
    const normY = (y / rect.height - 0.5) * 2; // -1 to 1
    setMousePos({ x, y, normX, normY });
  };

  // Interactive Property Map Markers
  const propertyMarkers = [
    {
      id: "p1",
      title: "Villa 24A • Ocean Penthouse",
      price: "₹2.45 Cr",
      specs: "4 Beds · 3 Baths · 3,200 sq.ft",
      status: "Active Listing",
      tag: "Ultra-Luxury",
      x: 32, // percentage on map
      y: 38,
      img: "/images/about/bluehour-modern-estate.jpg",
      location: "Marine Promenade, Sector 4",
    },
    {
      id: "p2",
      title: "The Glass Atrium",
      price: "₹4.80 Cr",
      specs: "5 Beds · 6 Baths · 5,400 sq.ft",
      status: "Premium",
      tag: "Under Escrow",
      x: 58,
      y: 28,
      img: "/images/about/enterprise-luxury-property.jpg",
      location: "Skyline Heights, Ridge Park",
    },
    {
      id: "p3",
      title: "Horizon Commercial Tower",
      price: "₹18.5 Cr",
      specs: "Grade A · 24,000 sq.ft Office Floor",
      status: "Institutional",
      tag: "94% Leased",
      x: 74,
      y: 62,
      img: "/hero-building-4k.jpg",
      location: "BKC Financial District",
    },
    {
      id: "p4",
      title: "Aura Terraces Penthouse",
      price: "₹3.20 Cr",
      specs: "3 Beds · 3.5 Baths · 2,850 sq.ft",
      status: "Sold",
      tag: "Registry Closed",
      x: 22,
      y: 68,
      img: "/images/about/about-villa.jpg",
      location: "Emerald Valley Sanctuary",
    },
  ];

  const [activeMarker, setActiveMarker] = useState(propertyMarkers[0]);

  // Lead Pipeline Auto-Animation (New -> Contacted -> Viewing -> Negotiation -> Closed)
  const pipelineSteps = [
    { id: "new", name: "NEW", desc: "Digital Ingestion", time: "5m ago" },
    { id: "contacted", name: "CONTACTED", desc: "First Briefing", time: "1h ago" },
    { id: "viewing", name: "VIEWING", desc: "Site Walkthrough", time: "Yesterday" },
    { id: "negotiation", name: "NEGOTIATION", desc: "Term Sheet Lock", time: "Active" },
    { id: "closed", name: "CLOSED", desc: "Escrow Settled", time: "Completed" },
  ];
  const [activeStepIdx, setActiveStepIdx] = useState(2);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const interval = setInterval(() => {
      setActiveStepIdx((prev) => (prev + 1) % pipelineSteps.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [shouldReduceMotion, pipelineSteps.length]);

  // Executive team members for Module 03
  const agentsList = [
    { name: "Marcus Sterling", role: "Capital Markets", status: "online", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
    { name: "Elena Rostova", role: "Private Client", status: "online", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80" },
    { name: "Kabir Mehta", role: "Land Acquisitions", status: "online", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
    { name: "Aria Chen", role: "Portfolio Strategy", status: "in-field", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" },
  ];

  return (
    <section
      id="why-us"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="scroll-mt-20 relative py-24 sm:py-32 lg:py-40 bg-[#07111F] text-[#F5F3ED] overflow-hidden selection:bg-[#D6A85F] selection:text-[#07111F] border-b border-[#D6A85F]/20"
    >
      {/* 1. MOUSE SPOTLIGHT (CHAMPAGNE GOLD & MUTED BLUE GLOW) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-700 opacity-60"
        style={{
          background: `radial-gradient(900px circle at ${mousePos.x}px ${mousePos.y}px, rgba(214,168,95,0.06), rgba(111,155,184,0.04) 45%, transparent 75%)`,
        }}
      />

      {/* 2. DYNAMIC CITY MASTERPLAN & BLUEPRINT BACKGROUND WITH SUBTLE PARALLAX */}
      <CityMasterplanGrid parallaxX={mousePos.normX * 18} parallaxY={mousePos.normY * 18} />

      {/* 3. SUBTLE DATA PARTICLES TRAVELING ALONG THIN LINES */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <span className="absolute top-1/4 left-1/6 w-1 h-1 bg-[#D6A85F] rounded-full animate-ping opacity-60" />
        <span className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-[#6F9BB8] rounded-full animate-pulse opacity-70" />
        <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-[#6FA58A] rounded-full animate-pulse opacity-80" />
        <span className="absolute top-1/2 right-1/12 w-1.5 h-1.5 bg-[#D6A85F] rounded-full opacity-50 animate-bounce" />
      </div>

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================= */}
        {/* SECTION HEADER: EDITORIAL TYPOGRAPHY & CINEMATIC REVEAL   */}
        {/* ========================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          {/* Small Uppercase Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#102238] border border-[#D6A85F]/25 mb-5 shadow-[0_4px_16px_rgba(7,17,31,0.6)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D6A85F] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-mono font-semibold text-[#D6A85F]">
              WHY CHOOSE US
            </span>
            <span className="text-[#6F9BB8] text-[10px] font-mono border-l border-[#D6A85F]/20 pl-2">
              REAL ESTATE OS v5.2
            </span>
          </div>

          {/* Main Cinematic Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#F5F3ED] leading-[1.12]"
          >
            The Intelligence Behind <br />
            <span className="font-editorial italic font-normal text-[#D6A85F] relative inline-block mt-1">
              Every Property Decision.
              {/* Subtle Champagne Underline Highlight Glow */}
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D6A85F]/50 to-transparent" />
            </span>
          </motion.h2>

          {/* Supporting Copy */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 text-sm sm:text-base md:text-[17px] text-[#9BA9B8] font-normal leading-relaxed max-w-2xl mx-auto"
          >
            One intelligent platform connecting properties, people, pipelines and performance —
            giving your real-estate business complete operational visibility.
          </motion.p>
        </div>

        {/* ========================================================= */}
        {/* MAIN HERO DASHBOARD & COMMAND CENTER                      */}
        {/* Centerpiece 3D Floating Application Window with Map & OS  */}
        {/* ========================================================= */}
        <div className="relative mb-16 sm:mb-20">
          
          {/* Subtle Ambient Backing Layer for Depth */}
          <div
            className="absolute -inset-4 sm:-inset-6 bg-gradient-to-b from-[#142A42]/30 via-[#102238]/20 to-transparent rounded-[36px] blur-2xl -z-10 pointer-events-none opacity-60"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 60, filter: "blur(10px)" }}
            animate={
              inView
                ? { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, scale: 0.88, y: 60, filter: "blur(10px)" }
            }
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
            style={{
              transform: shouldReduceMotion
                ? "none"
                : `perspective(1200px) rotateX(${mousePos.normY * -1.8}deg) rotateY(${mousePos.normX * 1.8}deg)`,
              transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
            className="relative rounded-3xl bg-[#102238] border border-[#D6A85F]/30 shadow-[0_30px_90px_rgba(7,17,31,0.9)] overflow-hidden"
          >
            {/* Top Command Center Title Bar */}
            <div className="h-12 bg-[#0C1929] border-b border-[#D6A85F]/20 px-4 sm:px-6 flex items-center justify-between">
              {/* Traffic Lights & OS Identifier */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E8C985]/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6F9BB8]/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6FA58A]/70" />
                </div>
                <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#D6A85F]/20 text-[11px] font-mono text-[#F5F3ED]">
                  <Cpu className="w-3.5 h-3.5 text-[#D6A85F]" />
                  <span className="font-semibold tracking-wider">REAL ESTATE OS</span>
                  <span className="text-[#6F9BB8] text-[9.5px]">v5.2-ENTERPRISE</span>
                </div>
              </div>

              {/* Status & Live Telemetry Ticker */}
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="hidden md:flex items-center gap-2 text-[#6F9BB8] text-[10.5px]">
                  <span>NODE: IN-WEST-BKC</span>
                  <span>•</span>
                  <span>LATENCY: 14ms</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#142A42] border border-[#6FA58A]/30 text-[#6FA58A] text-[10.5px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6FA58A] animate-pulse" />
                  <span>ALL SYSTEMS LIVE</span>
                </div>
              </div>
            </div>

            {/* Top Metrics Strip Inside Command Center */}
            <div className="bg-[#0C1929]/70 border-b border-[#D6A85F]/15 px-4 sm:px-8 py-4 sm:py-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#D6A85F]/15">
                
                {/* 1. 248 Properties */}
                <div className="pt-2 sm:pt-0 sm:pr-4">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-[#6F9BB8] block">
                    Total Properties
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-[#F5F3ED] tracking-tight mt-0.5">
                    <CountUpNumber end={248} />
                  </div>
                  <span className="text-[10px] text-[#6FA58A] font-medium flex items-center gap-1 mt-0.5">
                    <span>+18.4% YoY</span>
                  </span>
                </div>

                {/* 2. 124 Active Leads */}
                <div className="pt-2 sm:pt-0 sm:px-4">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-[#6F9BB8] block">
                    Active Leads
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-[#F5F3ED] tracking-tight mt-0.5">
                    <CountUpNumber end={124} />
                  </div>
                  <span className="text-[10px] text-[#D6A85F] font-medium flex items-center gap-1 mt-0.5">
                    <span>84% Qualified</span>
                  </span>
                </div>

                {/* 3. 42 Closed Deals */}
                <div className="pt-2 sm:pt-0 sm:px-4">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-[#6F9BB8] block">
                    Closed Deals (Q4)
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-[#F5F3ED] tracking-tight mt-0.5">
                    <CountUpNumber end={42} />
                  </div>
                  <span className="text-[10px] text-[#6FA58A] font-medium flex items-center gap-1 mt-0.5">
                    <span>14 Days Avg. Velocity</span>
                  </span>
                </div>

                {/* 4. ₹8.4Cr Portfolio Value (Champagne Gold Highlight) */}
                <div className="pt-2 sm:pt-0 sm:px-4">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-[#6F9BB8] block">
                    Portfolio Value
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-[#D6A85F] tracking-tight mt-0.5">
                    ₹8.4Cr
                  </div>
                  <span className="text-[10px] text-[#E8C985] font-medium flex items-center gap-1 mt-0.5">
                    <span>Target Cap 102%</span>
                  </span>
                </div>

                {/* 5. +24.8% Revenue Growth */}
                <div className="pt-2 sm:pt-0 sm:pl-4 col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-[#6F9BB8] block">
                    Revenue Growth
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-[#6FA58A] tracking-tight mt-0.5">
                    +24.8%
                  </div>
                  <span className="text-[10px] text-[#9BA9B8] font-mono mt-0.5 block">
                    Bloomberg Index +11.2%
                  </span>
                </div>

              </div>
            </div>

            {/* Main Interactive Work Area: Map + Side Intelligence Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px] sm:min-h-[520px]">
              
              {/* Left / Center: Interactive Abstract City Property Map (Cols 1-8) */}
              <div className="lg:col-span-8 relative bg-[#07111F] p-4 sm:p-6 flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-[#D6A85F]/20">
                
                {/* Map Control Toolbar */}
                <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#142A42] border border-[#D6A85F]/25 text-[#D6A85F]">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#F5F3ED] block">
                        Interactive Property Spatial Map
                      </span>
                      <span className="text-[10px] font-mono text-[#6F9BB8]">
                        SECTOR-04 // BKC COASTAL METROPOLIS
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-[#102238] border border-[#D6A85F]/25 text-[#D6A85F] text-[10px] font-mono">
                      {propertyMarkers.length} KEY PROPERTIES ACTIVE
                    </span>
                  </div>
                </div>

                {/* The Abstract City Map Vector Canvas */}
                <div className="relative w-full h-[320px] sm:h-[380px] rounded-2xl bg-[#091524] border border-[#D6A85F]/20 overflow-hidden shadow-inner">
                  
                  {/* City Vector Layout (Coastline, Avenue Grids, City Blocks) */}
                  <svg viewBox="0 0 800 500" className="w-full h-full object-cover pointer-events-none select-none opacity-45">
                    {/* Water / Coastline contour */}
                    <path
                      d="M 0 350 Q 200 420 400 340 T 800 280 L 800 500 L 0 500 Z"
                      fill="#0C1E34"
                      stroke="#6F9BB8"
                      strokeWidth="1"
                    />
                    {/* Transit Routes */}
                    <path d="M 50 50 L 750 450" stroke="#D6A85F" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.6" />
                    <path d="M 120 480 L 680 40" stroke="#6F9BB8" strokeWidth="1" strokeDasharray="6 4" opacity="0.5" />
                    {/* City Block Grid */}
                    {Array.from({ length: 9 }).map((_, i) => (
                      <line key={`x-${i}`} x1={i * 90 + 30} y1="20" x2={i * 90 + 30} y2="480" stroke="#6F9BB8" strokeWidth="0.5" strokeOpacity="0.25" />
                    ))}
                    {Array.from({ length: 6 }).map((_, j) => (
                      <line key={`y-${j}`} x1="20" y1={j * 80 + 30} x2="780" y2={j * 80 + 30} stroke="#6F9BB8" strokeWidth="0.5" strokeOpacity="0.25" />
                    ))}
                  </svg>

                  {/* Interactive Property Markers */}
                  {propertyMarkers.map((marker) => {
                    const isSelected = activeMarker.id === marker.id;
                    return (
                      <div
                        key={marker.id}
                        onClick={() => setActiveMarker(marker)}
                        onMouseEnter={() => setActiveMarker(marker)}
                        style={{
                          left: `${marker.x}%`,
                          top: `${marker.y}%`,
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group/pin"
                      >
                        {/* Outer Pulsing Ring */}
                        <span
                          className={`absolute -inset-2.5 rounded-full transition-all duration-300 ${
                            isSelected
                              ? "bg-[#D6A85F]/30 animate-ping"
                              : "bg-[#6F9BB8]/20 group-hover/pin:bg-[#D6A85F]/30 animate-pulse"
                          }`}
                        />

                        {/* Center Marker Pin */}
                        <div
                          className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                            isSelected
                              ? "bg-[#D6A85F] text-[#07111F] ring-4 ring-[#D6A85F]/30 scale-110"
                              : "bg-[#142A42] border border-[#D6A85F]/40 text-[#D6A85F] group-hover/pin:scale-105"
                          }`}
                        >
                          <Building2 className="w-3.5 h-3.5" />
                        </div>

                        {/* Mini floating label below marker */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2 py-0.5 rounded bg-[#07111F]/90 backdrop-blur-md border border-[#D6A85F]/20 text-[9px] font-mono text-[#F5F3ED] whitespace-nowrap shadow-md pointer-events-none">
                          <span className="text-[#D6A85F] font-bold">{marker.price}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Property Card Detail Popover (Active Marker Hover Preview) */}
                  <AnimatePresence mode="wait">
                    {activeMarker && (
                      <motion.div
                        key={activeMarker.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-84 z-40 rounded-2xl bg-[#0C1929]/95 backdrop-blur-xl border border-[#D6A85F]/35 p-3.5 shadow-[0_20px_40px_rgba(7,17,31,0.85)]"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={activeMarker.img}
                            alt={activeMarker.title}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#D6A85F]/30"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="text-[10px] font-mono uppercase text-[#6FA58A] bg-[#142A42] px-1.5 py-0.2 rounded border border-[#6FA58A]/30">
                                {activeMarker.status}
                              </span>
                              <span className="text-xs font-bold text-[#D6A85F]">
                                {activeMarker.price}
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-[#F5F3ED] truncate">
                              {activeMarker.title}
                            </h4>
                            <p className="text-[10px] text-[#9BA9B8] truncate mt-0.5">
                              {activeMarker.specs}
                            </p>
                            <p className="text-[9px] text-[#6F9BB8] font-mono truncate mt-0.5">
                              {activeMarker.location}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>

                {/* Map Bottom Telemetry Legend */}
                <div className="relative z-20 mt-3 pt-2 border-t border-[#D6A85F]/15 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#9BA9B8]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#D6A85F]" /> Ultra-Luxury
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#6F9BB8]" /> Commercial Hub
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#6FA58A]" /> Title Verified
                    </span>
                  </div>
                  <span className="text-[#6F9BB8]">CLICK ANY PIN TO INSPECT ASSET</span>
                </div>

              </div>

              {/* Right: Live Analytics & Ledger Panel (Cols 9-12) */}
              <div className="lg:col-span-4 bg-[#0C1929] p-4 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D6A85F]/15">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#D6A85F]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#F5F3ED]">
                        Executive Ledger
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#6FA58A] bg-[#142A42] px-2 py-0.5 rounded border border-[#6FA58A]/30">
                      LIVE STREAM
                    </span>
                  </div>

                  {/* Portfolio Growth Meter */}
                  <div className="mb-5 p-3.5 rounded-2xl bg-[#102238] border border-[#D6A85F]/20">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[#9BA9B8]">Cap Rate Optimization</span>
                      <span className="text-[#D6A85F] font-bold font-mono">8.4% Net Yield</span>
                    </div>
                    <div className="h-2 w-full bg-[#07111F] rounded-full overflow-hidden flex">
                      <div className="h-full bg-[#D6A85F] w-[64%]" />
                      <div className="h-full bg-[#6F9BB8] w-[26%]" />
                      <div className="h-full bg-[#6FA58A] w-[10%]" />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-[#6F9BB8] mt-1.5">
                      <span>Residential (64%)</span>
                      <span>Commercial (26%)</span>
                      <span>Land (10%)</span>
                    </div>
                  </div>

                  {/* Real-Time Transaction Flow Feed */}
                  <div className="space-y-2.5">
                    <span className="text-[10.5px] uppercase font-mono tracking-wider text-[#6F9BB8] block">
                      Recent Ledger Transactions
                    </span>

                    <div className="p-2.5 rounded-xl bg-[#142A42]/70 border border-[#D6A85F]/15 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[11px] font-semibold text-[#F5F3ED]">
                          Deposit Escrow Confirmed
                        </div>
                        <div className="text-[9.5px] text-[#6F9BB8] font-mono">
                          Villa 24A • ₹24.5L Escrow Hold
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#6FA58A]">Just Now</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#142A42]/70 border border-[#D6A85F]/15 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[11px] font-semibold text-[#F5F3ED]">
                          RERA Title Clearance
                        </div>
                        <div className="text-[9.5px] text-[#6F9BB8] font-mono">
                          Horizon Tower // 100% Validated
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#D6A85F]">12m ago</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#142A42]/70 border border-[#D6A85F]/15 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[11px] font-semibold text-[#F5F3ED]">
                          Digital Lock Contract Issued
                        </div>
                        <div className="text-[9.5px] text-[#6F9BB8] font-mono">
                          Sky Villa IX // Multi-Sig Pending
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#9BA9B8]">1h ago</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action inside Command Center */}
                <div className="mt-5 pt-3 border-t border-[#D6A85F]/15">
                  <div className="text-[10.5px] text-[#9BA9B8] leading-tight mb-3">
                    Automated bank-grade escrow ledgers guarantee zero buyer drop-off and instant broker payouts.
                  </div>
                  <button
                    onClick={() => {
                      const el = document.getElementById("about");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#D6A85F] text-[#07111F] font-bold text-xs hover:bg-[#E8C985] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>Launch OS Simulation</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </div>

          </motion.div>
        </div>

        {/* ========================================================= */}
        {/* FLOATING INTELLIGENCE MODULES (4 ENTERPRISE CARDS)        */}
        {/* Extracted Data Modules Orbiting The Platform             */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          
          {/* MODULE 01: PROPERTY INTELLIGENCE */}
          <TiltCard maxTilt={4.5}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.94 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl bg-[#102238] border border-[#D6A85F]/20 p-5 shadow-[0_12px_35px_rgba(7,17,31,0.6)] flex flex-col justify-between h-full hover:border-[#D6A85F]/40 transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#6F9BB8] font-semibold">
                    MODULE 01
                  </span>
                  <div className="p-1 rounded bg-[#142A42] border border-[#D6A85F]/25 text-[#D6A85F]">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-xs uppercase font-mono tracking-wider text-[#D6A85F] font-semibold">
                  PROPERTY INTELLIGENCE
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#F5F3ED] tracking-tight mt-1">
                  <CountUpNumber end={248} suffix=" Properties" />
                </div>
                <div className="text-xs font-semibold text-[#6FA58A] mt-0.5">
                  +18.4% Portfolio Growth
                </div>
              </div>

              {/* Miniature Animated Property Visualization */}
              <div className="mt-5 p-3 rounded-xl bg-[#0C1929] border border-[#D6A85F]/15">
                <div className="flex justify-between items-center text-[9px] font-mono text-[#6F9BB8] mb-1.5">
                  <span>FACADE ELEVATION</span>
                  <span className="text-[#D6A85F]">CAD v4</span>
                </div>
                <svg viewBox="0 0 120 40" className="w-full h-10 stroke-[#6F9BB8]">
                  <rect x="10" y="5" width="20" height="32" fill="#142A42" strokeWidth="0.8" />
                  <rect x="35" y="10" width="30" height="27" fill="#102238" strokeWidth="0.8" />
                  <rect x="70" y="2" width="40" height="35" fill="#142A42" strokeWidth="0.8" stroke="#D6A85F" />
                  {/* Active window telemetry */}
                  <line x1="75" y1="10" x2="105" y2="10" strokeWidth="0.6" strokeDasharray="1 1" />
                  <line x1="75" y1="18" x2="105" y2="18" strokeWidth="0.6" strokeDasharray="1 1" />
                  <circle cx="85" cy="14" r="1.5" fill="#D6A85F" className="animate-pulse" />
                  <circle cx="95" cy="14" r="1.5" fill="#6FA58A" />
                </svg>
              </div>
            </motion.div>
          </TiltCard>

          {/* MODULE 02: LEAD PIPELINE (ANIMATED PIPELINE STAGES) */}
          <TiltCard maxTilt={4.5}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.94 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl bg-[#102238] border border-[#D6A85F]/20 p-5 shadow-[0_12px_35px_rgba(7,17,31,0.6)] flex flex-col justify-between h-full hover:border-[#D6A85F]/40 transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#6F9BB8] font-semibold">
                    MODULE 02
                  </span>
                  <div className="p-1 rounded bg-[#142A42] border border-[#D6A85F]/25 text-[#D6A85F]">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-xs uppercase font-mono tracking-wider text-[#D6A85F] font-semibold">
                  LEAD PIPELINE
                </div>
                <div className="text-xs text-[#9BA9B8] mt-1">
                  Automated Conversion Engine
                </div>
              </div>

              {/* Vertical / Compact Pipeline Flow */}
              <div className="mt-4 space-y-1.5">
                {pipelineSteps.map((step, idx) => {
                  const isActive = idx === activeStepIdx;
                  return (
                    <div
                      key={step.id}
                      onClick={() => setActiveStepIdx(idx)}
                      className={`px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs cursor-pointer transition-all duration-300 ${
                        isActive
                          ? "bg-[#D6A85F] text-[#07111F] font-bold shadow-md"
                          : "bg-[#0C1929] text-[#9BA9B8] hover:text-[#F5F3ED]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] opacity-75">{idx + 1}.</span>
                        <span className="font-mono text-[10.5px]">{step.name}</span>
                      </div>
                      <span className="text-[9.5px] font-mono">{step.time}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </TiltCard>

          {/* MODULE 03: TEAM PERFORMANCE */}
          <TiltCard maxTilt={4.5}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.94 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl bg-[#102238] border border-[#D6A85F]/20 p-5 shadow-[0_12px_35px_rgba(7,17,31,0.6)] flex flex-col justify-between h-full hover:border-[#D6A85F]/40 transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#6F9BB8] font-semibold">
                    MODULE 03
                  </span>
                  <div className="p-1 rounded bg-[#142A42] border border-[#D6A85F]/25 text-[#D6A85F]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-xs uppercase font-mono tracking-wider text-[#D6A85F] font-semibold">
                  TEAM PERFORMANCE
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#F5F3ED] tracking-tight mt-1">
                  <CountUpNumber end={48} suffix=" Agents" />
                </div>
                <div className="text-xs font-semibold text-[#6FA58A] mt-0.5">
                  92% Performance Rating
                </div>
              </div>

              {/* Agent Headshots & Live Status Beacons */}
              <div className="mt-5 p-3 rounded-xl bg-[#0C1929] border border-[#D6A85F]/15">
                <div className="flex -space-x-2 mb-2 overflow-hidden py-0.5">
                  {agentsList.map((ag, i) => (
                    <div key={i} className="relative group/ag cursor-pointer">
                      <img
                        src={ag.img}
                        alt={ag.name}
                        title={`${ag.name} • ${ag.role}`}
                        className="w-8 h-8 rounded-full ring-2 ring-[#102238] object-cover hover:scale-110 transition-transform"
                      />
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#6FA58A] ring-1 ring-[#07111F]" />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center text-[9.5px] font-mono text-[#6F9BB8]">
                  <span>Active in Field: 38</span>
                  <span className="text-[#D6A85F]">Avg 14d close</span>
                </div>
              </div>
            </motion.div>
          </TiltCard>

          {/* MODULE 04: PORTFOLIO ANALYTICS (ANIMATED LINE CHART) */}
          <TiltCard maxTilt={4.5}>
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.94 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl bg-[#102238] border border-[#D6A85F]/20 p-5 shadow-[0_12px_35px_rgba(7,17,31,0.6)] flex flex-col justify-between h-full hover:border-[#D6A85F]/40 transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#6F9BB8] font-semibold">
                    MODULE 04
                  </span>
                  <div className="p-1 rounded bg-[#142A42] border border-[#D6A85F]/25 text-[#D6A85F]">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-xs uppercase font-mono tracking-wider text-[#D6A85F] font-semibold">
                  PORTFOLIO ANALYTICS
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-[#6FA58A] tracking-tight mt-1">
                  +24.8%
                </div>
                <div className="text-xs text-[#9BA9B8] mt-0.5">
                  Revenue Growth QoQ
                </div>
              </div>

              {/* Progressive Drawing Chart */}
              <div className="mt-5 p-3 rounded-xl bg-[#0C1929] border border-[#D6A85F]/15">
                <div className="h-12 w-full relative">
                  <svg viewBox="0 0 140 40" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="whyUsChartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D6A85F" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#D6A85F" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <polygon points="0,38 0,32 35,28 70,20 105,14 140,4 140,38" fill="url(#whyUsChartGrad)" />
                    <motion.path
                      d="M 0,32 Q 20,30 35,28 T 70,20 T 105,14 T 140,4"
                      fill="none"
                      stroke="#D6A85F"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
                      transition={{ duration: 1.6, delay: 0.4, ease: "easeOut" }}
                    />
                    <circle cx="140" cy="4" r="3.5" fill="#E8C985" />
                  </svg>
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono text-[#6F9BB8] mt-1 pt-1 border-t border-[#D6A85F]/15">
                  <span>Q1: ₹18.2Cr</span>
                  <span className="text-[#D6A85F] font-semibold">Q4: ₹39.7Cr</span>
                </div>
              </div>
            </motion.div>
          </TiltCard>

        </div>

        {/* ========================================================= */}
        {/* SECTION TRANSITION: ARCHITECTURAL DATA FLOW               */}
        {/* Storytelling Transition Into The Next Section            */}
        {/* ========================================================= */}
        <div className="relative pt-8 pb-4 border-t border-[#D6A85F]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#6F9BB8]">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#D6A85F]" />
            <span className="text-[#F5F3ED] font-semibold">ENTERPRISE PIPELINE:</span>
            <span>PROPERTIES → LEADS → ESCROW LEDGERS → SETTLEMENTS</span>
          </div>
          <div className="flex items-center gap-2 text-[#9BA9B8]">
            <span>SYSTEM AUDIT: 100% RERA COMPLIANT</span>
            <span>•</span>
            <span className="text-[#D6A85F]">CONTINUOUS TELEMETRY ACTIVE</span>
          </div>
        </div>

      </div>
    </section>
  );
}

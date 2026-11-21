import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useScrollDirection } from "../../hooks/useScrollDirection";
import {
  Star,
  CheckCircle2,
  Building2,
  TrendingUp,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Briefcase,
  Users,
} from "lucide-react";

// Subtle Architectural Blueprint Wireframe SVG for background
const TestimonialBlueprint = () => (
  <svg
    viewBox="0 0 1000 600"
    fill="none"
    className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-[0.05]"
  >
    <rect x="50" y="50" width="900" height="500" stroke="#6F9BB8" strokeWidth="1" strokeDasharray="6 6" />
    <line x1="50" y1="200" x2="950" y2="200" stroke="#6F9BB8" strokeWidth="0.8" strokeDasharray="4 4" />
    <line x1="50" y1="400" x2="950" y2="400" stroke="#6F9BB8" strokeWidth="0.8" strokeDasharray="4 4" />
    <line x1="350" y1="50" x2="350" y2="550" stroke="#6F9BB8" strokeWidth="0.8" strokeDasharray="4 4" />
    <line x1="680" y1="50" x2="680" y2="550" stroke="#6F9BB8" strokeWidth="0.8" strokeDasharray="4 4" />
    {/* Floorplan details */}
    <rect x="80" y="80" width="230" height="100" stroke="#D6A85F" strokeWidth="1" />
    <rect x="380" y="80" width="270" height="100" stroke="#6F9BB8" strokeWidth="1" />
    <rect x="710" y="80" width="210" height="100" stroke="#D6A85F" strokeWidth="1" />
    <circle cx="200" cy="130" r="25" stroke="#D6A85F" strokeWidth="0.8" strokeDasharray="2 2" />
    <path d="M 500 250 A 60 60 0 0 1 560 310" stroke="#6F9BB8" strokeWidth="0.8" strokeDasharray="2 2" />
    {/* Micro labels */}
    <text x="90" y="70" fill="#6F9BB8" fontSize="8" fontFamily="monospace" letterSpacing="1">
      SECTOR 04 // ESCROW LEDGER FACILITY
    </text>
    <text x="390" y="70" fill="#D6A85F" fontSize="8" fontFamily="monospace" letterSpacing="1">
      EXECUTIVE TRANSACTION ATELIER
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

// 5 Featured Client Executive Profiles
const FEATURED_CLIENTS = [
  {
    id: "arjun",
    name: "Arjun Mehta",
    role: "Managing Director",
    company: "Meridian Realty",
    location: "Kolkata · India",
    coordinates: "22°34'N 88°21'E",
    properties: "480+",
    growth: "+31.4%",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000&auto=format&fit=crop&q=85",
    rating: 5,
    quote:
      "The platform completely changed how our team manages properties, leads and client relationships. We finally have one place to understand what's happening across the entire business.",
    highlightMetric: "480+ Properties Managed",
  },
  {
    id: "devika",
    name: "Devika Singhania",
    role: "Chief Investment Officer",
    company: "Sovereign Capital",
    location: "Mumbai · India",
    coordinates: "18°59'N 72°50'E",
    properties: "620+",
    growth: "+38.6%",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1000&auto=format&fit=crop&q=85",
    rating: 5,
    quote:
      "From underwriting land acquisitions to monitoring escrow clearance across multiple developments, this is the first enterprise real-estate operating system that actually delivers complete institutional transparency.",
    highlightMetric: "₹180Cr Asset Flow",
  },
  {
    id: "rajesh",
    name: "Rajesh Chawla",
    role: "Head of Acquisitions",
    company: "Horizon Group",
    location: "Delhi NCR · India",
    coordinates: "28°36'N 77°12'E",
    properties: "350+",
    growth: "+27.2%",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1000&auto=format&fit=crop&q=85",
    rating: 5,
    quote:
      "Our broker teams used to juggle fragmented CRMs and unverified listings. Today, our 120 brokers operate in real time with synchronized leads, instant RERA verification, and zero transaction drag.",
    highlightMetric: "14-Day Deal Cycle",
  },
  {
    id: "natasha",
    name: "Natasha Rao",
    role: "Principal Broker",
    company: "Prestige Assets",
    location: "Bangalore · India",
    coordinates: "12°58'N 77°35'E",
    properties: "290+",
    growth: "+42.1%",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1000&auto=format&fit=crop&q=85",
    rating: 5,
    quote:
      "The buyer confidence we achieve through digital milestone locks and verified property dossiers is unprecedented. Our high-net-worth clients appreciate the discretion and speed of handover.",
    highlightMetric: "99.2% Client Trust",
  },
  {
    id: "viktor",
    name: "Viktor Lindqvist",
    role: "Managing Partner",
    company: "Nordic Bay Holdings",
    location: "International Assets",
    coordinates: "59°19'N 18°04'E",
    properties: "540+",
    growth: "+29.8%",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=85",
    rating: 5,
    quote:
      "Cross-border real estate transactions usually come with compliance nightmares. PrimeNest's automated escrow ledgers and multi-currency pipeline gave our global fund effortless control.",
    highlightMetric: "Cross-Border Escrow",
  },
];

// Monochrome Logos for Logo Wall
const CLIENT_LOGOS = [
  "MERIDIAN REALTY",
  "SOVEREIGN CAPITAL",
  "HORIZON ASSETS",
  "PRESTIGE DEVELOPMENTS",
  "METRO LIVING",
  "APEX PARTNERS",
  "VANGUARD LIVING",
  "BAY CREST PROPERTIES",
];

// 3 Secondary Testimonial Modules
const SECONDARY_TESTIMONIALS = [
  {
    roleTag: "Broker",
    quote: "Our lead conversion became dramatically easier to track and nurture through the automated pipeline.",
    author: "Priya Sharma",
    title: "Senior Broker · Prime Metropolitan",
    metric: "+32% Lead Conversion",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  },
  {
    roleTag: "Developer",
    quote: "We now have complete visibility across our construction milestones, inventory locks and sales pipeline.",
    author: "Rahul Kapoor",
    title: "Project Director · Skyline Towers",
    metric: "+24% Sales Efficiency",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
  },
  {
    roleTag: "Agency",
    quote: "The team finally stopped working across disconnected spreadsheets. Every agent has clear weekly goals.",
    author: "Neha Roy",
    title: "Operations Head · Sovereign Realty",
    metric: "-41% Manual Work",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&auto=format&fit=crop&q=80",
  },
];

export default function EditorialTestimonials() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.15 });
  const shouldReduceMotion = useReducedMotion();
  const { scrollDirection } = useScrollDirection();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const blueprintParallaxY = useTransform(scrollYProgress, [0, 1], [-25, 25]);

  // Active Testimonial State
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  // Mouse spotlight state
  const [mousePos, setMousePos] = useState({ x: 600, y: 350 });
  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Autoplay timer with progressive indicator (6.5s cycle)
  const ROTATE_DURATION_MS = 6500;
  useEffect(() => {
    if (shouldReduceMotion || isPaused) return;

    const intervalStep = 50;
    const progressIncrement = (intervalStep / ROTATE_DURATION_MS) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveIdx((curr) => (curr + 1) % FEATURED_CLIENTS.length);
          return 0;
        }
        return prev + progressIncrement;
      });
    }, intervalStep);

    return () => clearInterval(timer);
  }, [shouldReduceMotion, isPaused, activeIdx]);

  const selectClient = (idx) => {
    setActiveIdx(idx);
    setProgress(0);
  };

  const current = FEATURED_CLIENTS[activeIdx];

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="scroll-mt-20 relative py-24 sm:py-32 lg:py-36 bg-[#07111F] text-[#F5F3ED] overflow-hidden selection:bg-[#D6A85F] selection:text-[#07111F] border-b border-[#D6A85F]/20"
    >
      {/* 1. SOFT CURSOR-FOLLOWING SPOTLIGHT */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-700 opacity-60"
        style={{
          background: `radial-gradient(900px circle at ${mousePos.x}px ${mousePos.y}px, rgba(214,168,95,0.06), rgba(111,155,184,0.04) 45%, transparent 75%)`,
        }}
      />

      {/* 2. AMBIENT GLOWS: CHAMPAGNE & MUTED BLUE */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 w-96 h-96 bg-[#D6A85F]/5 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-[#6F9BB8]/5 rounded-full blur-3xl -z-10" />

      {/* 3. ARCHITECTURAL BLUEPRINT GRID */}
      <TestimonialBlueprint />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================= */}
        {/* SECTION INTRO: EDITORIAL HEADING & TRUST METRICS          */}
        {/* ========================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          {/* Small Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#102238] border border-[#D6A85F]/25 mb-4 shadow-[0_2px_12px_rgba(7,17,31,0.5)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D6A85F] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-mono font-semibold text-[#D6A85F]">
              CLIENT EXPERIENCES
            </span>
            <span className="text-[#6F9BB8] text-[10px] font-mono border-l border-[#D6A85F]/20 pl-2">
              VERIFIED PORTFOLIO LEADERS
            </span>
          </div>

          {/* Large Editorial Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#F5F3ED] leading-[1.12]"
          >
            Trusted By The People <br />
            <span className="font-editorial italic font-normal text-[#D6A85F]">
              Building Real Estate Forward.
            </span>
          </motion.h2>

          {/* Supporting Copy */}
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-sm sm:text-base md:text-[17px] text-[#9BA9B8] leading-relaxed max-w-2xl mx-auto"
          >
            From independent brokers to growing property enterprises, professionals use our
            platform to bring every part of their real-estate operation together.
          </motion.p>
        </div>

        {/* ========================================================= */}
        {/* HORIZONTAL TRUST METRICS STRIP                            */}
        {/* 2,500+ PROPERTIES | 850+ CLIENTS | 120+ TEAMS | 98.6% SAT */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl bg-[#0B1727] border border-[#D6A85F]/20 p-4 sm:p-6 mb-16 shadow-[0_12px_40px_rgba(7,17,31,0.6)]"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#D6A85F]/15">
            {/* Metric 1 */}
            <div className="text-center sm:text-left sm:pr-4 pt-1 sm:pt-0">
              <span className="font-editorial text-3xl sm:text-4xl text-[#F5F3ED] font-normal block leading-none">
                <CountUpNumber end={2500} suffix="+" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F9BB8] font-semibold mt-2 block">
                PROPERTIES MANAGED
              </span>
              <span className="text-[11px] text-[#9BA9B8] mt-0.5 block">
                Institutional &amp; private assets
              </span>
            </div>

            {/* Metric 2 */}
            <div className="text-center sm:text-left sm:px-4 pt-2 sm:pt-0">
              <span className="font-editorial text-3xl sm:text-4xl text-[#D6A85F] font-normal block leading-none">
                <CountUpNumber end={850} suffix="+" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F9BB8] font-semibold mt-2 block">
                ACTIVE CLIENTS
              </span>
              <span className="text-[11px] text-[#9BA9B8] mt-0.5 block">
                Developers, brokers &amp; offices
              </span>
            </div>

            {/* Metric 3 */}
            <div className="text-center sm:text-left sm:px-4 pt-2 sm:pt-0">
              <span className="font-editorial text-3xl sm:text-4xl text-[#F5F3ED] font-normal block leading-none">
                <CountUpNumber end={120} suffix="+" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6F9BB8] font-semibold mt-2 block">
                REAL ESTATE TEAMS
              </span>
              <span className="text-[11px] text-[#9BA9B8] mt-0.5 block">
                Regional certified brokerages
              </span>
            </div>

            {/* Metric 4 */}
            <div className="text-center sm:text-left sm:pl-4 pt-2 sm:pt-0">
              <span className="font-editorial text-3xl sm:text-4xl text-[#6FA58A] font-normal block leading-none">
                <CountUpNumber end={98.6} decimals={1} suffix="%" />
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6FA58A] font-semibold mt-2 block">
                CLIENT SATISFACTION
              </span>
              <span className="text-[11px] text-[#9BA9B8] mt-0.5 block">
                Annual platform renewal rate
              </span>
            </div>
          </div>
        </motion.div>

        {/* ========================================================= */}
        {/* MAIN FEATURED TESTIMONIAL EXPERIENCE (VISUALLY HEAVY)     */}
        {/* 40% Width Portrait + Floating Data Panel + Editorial Quote */}
        {/* ========================================================= */}
        <div className="relative mb-12 sm:mb-16">
          
          {/* HUGE ELEGANT FLOATING QUOTATION MARK IN CHAMPAGNE GOLD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 0.08, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute -top-12 -left-6 sm:-left-10 text-[180px] sm:text-[240px] font-editorial text-[#D6A85F] select-none leading-none z-0"
          >
            “
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 rounded-3xl bg-[#102238] border border-[#D6A85F]/25 shadow-[0_25px_70px_rgba(7,17,31,0.9)] overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              
              {/* ===================================================== */}
              {/* LEFT: 40% WIDTH CLIENT PORTRAIT & DATA OVERLAYS       */}
              {/* ===================================================== */}
              <div className="lg:col-span-5 relative min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] bg-[#0B1727] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, scale: 1.08, clipPath: "inset(100% 0% 0% 0%)" }}
                    animate={
                      inView
                        ? { opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }
                        : { opacity: 0, scale: 1.08, clipPath: "inset(100% 0% 0% 0%)" }
                    }
                    exit={{ opacity: 0, scale: 1.04, clipPath: "inset(100% 0% 0% 0%)" }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <img
                      src={current.image}
                      alt={`${current.name} — ${current.company}`}
                      className="w-full h-full object-cover object-top filter brightness-[0.92] contrast-[1.05]"
                    />
                    {/* Cinematic Dark Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-[#07111F]/30 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#102238]/60 pointer-events-none" />
                  </motion.div>
                </AnimatePresence>

                {/* Top Location Coordinates Badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#07111F]/85 backdrop-blur-md border border-[#D6A85F]/25 text-[10px] font-mono text-[#F5F3ED]">
                  <MapPin className="w-3 h-3 text-[#D6A85F]" />
                  <span>{current.coordinates}</span>
                </div>

                {/* Floating Client Business Information Panel */}
                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <motion.div
                    key={`panel-${current.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#07111F]/90 backdrop-blur-xl border border-[#D6A85F]/30 shadow-xl"
                  >
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D6A85F]/15">
                      <div>
                        <span className="font-mono text-xs font-bold tracking-wider text-[#D6A85F] block uppercase">
                          {current.company}
                        </span>
                        <span className="text-[10px] font-mono text-[#9BA9B8]">
                          {current.location}
                        </span>
                      </div>
                      <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-[#142A42] text-[#6FA58A] border border-[#6FA58A]/30">
                        {current.highlightMetric}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-[#102238] p-2 rounded-xl border border-[#D6A85F]/15">
                        <span className="text-[9.5px] font-mono text-[#6F9BB8] uppercase block">
                          PROPERTIES
                        </span>
                        <span className="text-base sm:text-lg font-bold font-mono text-[#F5F3ED]">
                          {current.properties}
                        </span>
                      </div>
                      <div className="bg-[#102238] p-2 rounded-xl border border-[#D6A85F]/15">
                        <span className="text-[9.5px] font-mono text-[#6F9BB8] uppercase block">
                          GROWTH
                        </span>
                        <span className="text-base sm:text-lg font-bold font-mono text-[#6FA58A]">
                          {current.growth}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* ===================================================== */}
              {/* RIGHT: 60% TESTIMONIAL EDITORIAL CONTENT & AUTHOR      */}
              {/* ===================================================== */}
              <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
                
                {/* 5 Champagne Gold Stars & Verified Badge */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    {/* Stars */}
                    <div className="flex items-center gap-1.5 text-[#D6A85F]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#D6A85F] text-[#D6A85F]" />
                      ))}
                      <span className="text-xs font-mono font-bold text-[#D6A85F] ml-2">
                        5.0 / 5.0
                      </span>
                    </div>

                    {/* Verified Client Badge */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#142A42] border border-[#6FA58A]/35 text-[10px] font-mono font-semibold text-[#6FA58A]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>✓ VERIFIED CLIENT</span>
                    </span>
                  </div>

                  {/* Testimonial Quote */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.id}
                      initial={{ opacity: 0, y: 28 }}
                      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <blockquote className="font-editorial text-2xl sm:text-3xl lg:text-[34px] text-[#F5F3ED] font-normal leading-[1.3] tracking-tight">
                        &ldquo;{current.quote}&rdquo;
                      </blockquote>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Author Info & Navigation Controls */}
                <div className="mt-8 pt-6 border-t border-[#D6A85F]/15 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`author-${current.id}`}
                      initial={{ opacity: 0, x: -25 }}
                      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -25 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <h4 className="font-editorial text-xl sm:text-2xl text-[#F5F3ED] font-semibold">
                        {current.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#9BA9B8] mt-0.5">
                        {current.role} ·{" "}
                        <span className="text-[#D6A85F] font-semibold">{current.company}</span>
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {/* Manual Arrow Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => selectClient((activeIdx - 1 + FEATURED_CLIENTS.length) % FEATURED_CLIENTS.length)}
                      aria-label="Previous testimonial"
                      className="w-10 h-10 rounded-xl bg-[#0B1727] border border-[#D6A85F]/30 text-[#F5F3ED] hover:border-[#D6A85F] hover:text-[#D6A85F] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => selectClient((activeIdx + 1) % FEATURED_CLIENTS.length)}
                      aria-label="Next testimonial"
                      className="w-10 h-10 rounded-xl bg-[#0B1727] border border-[#D6A85F]/30 text-[#F5F3ED] hover:border-[#D6A85F] hover:text-[#D6A85F] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Progress Bar Indicator for Automatic Rotation */}
            <div className="h-1 w-full bg-[#0B1727]">
              <div
                className="h-full bg-gradient-to-r from-[#D6A85F] to-[#E8C985] transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

          </motion.div>

          {/* Testimonial Avatar Selector Strip (Horizontal Carousel Navigation) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {FEATURED_CLIENTS.map((client, idx) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  key={client.id}
                  onClick={() => selectClient(idx)}
                  className={`group flex items-center gap-2.5 px-3 py-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-[#142A42] border border-[#D6A85F] ring-2 ring-[#D6A85F]/30 shadow-md scale-105"
                      : "bg-[#0B1727] border border-[#D6A85F]/15 hover:border-[#D6A85F]/40"
                  }`}
                >
                  <img
                    src={client.image}
                    alt={client.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span
                    className={`text-[11px] font-mono tracking-wider transition-colors ${
                      isActive ? "text-[#D6A85F] font-bold" : "text-[#9BA9B8] group-hover:text-[#F5F3ED]"
                    }`}
                  >
                    0{idx + 1} // {client.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* ========================================================= */}
        {/* CLIENT LOGO WALL: TRUSTED BY REAL ESTATE PROFESSIONALS    */}
        {/* Subtle Infinite Marquee with Monochrome Ivory Logos       */}
        {/* ========================================================= */}
        <div className="mb-20 pt-8 border-t border-[#D6A85F]/15">
          <div className="text-center mb-6">
            <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-[#6F9BB8] font-semibold">
              TRUSTED BY REAL ESTATE ENTERPRISES &amp; INVESTMENT FUNDS
            </span>
          </div>

          <div className="relative overflow-hidden w-full py-4">
            {/* Left & Right Fade Gradients */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#07111F] to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#07111F] to-transparent z-10" />

            <div className="flex gap-8 whitespace-nowrap animate-marquee">
              {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((logo, i) => (
                <div
                  key={i}
                  className="px-6 py-2.5 rounded-xl bg-[#0B1727] border border-[#D6A85F]/15 text-[#F5F3ED]/65 hover:text-[#D6A85F] hover:border-[#D6A85F]/40 transition-colors text-xs font-mono tracking-widest font-semibold flex items-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#D6A85F]/70" />
                  <span>{logo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECONDARY TESTIMONIAL CARDS (3 INTERACTIVE MODULES)       */}
        {/* Broker • Developer • Agency with Verified Metrics         */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SECONDARY_TESTIMONIALS.map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 * idx }}
              className="group relative rounded-2xl bg-[#102238] border border-[#D6A85F]/20 p-6 shadow-lg flex flex-col justify-between hover:border-[#D6A85F]/50 hover:-translate-y-1.5 transition-all duration-300"
            >
              <div>
                {/* Header Tag & Business Metric */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-[#142A42] text-[#D6A85F] border border-[#D6A85F]/25 font-semibold">
                    {card.roleTag}
                  </span>
                  <span className="text-[10.5px] font-mono font-bold text-[#6FA58A] bg-[#0B1727] px-2.5 py-0.5 rounded border border-[#6FA58A]/30">
                    {card.metric}
                  </span>
                </div>

                {/* Quote */}
                <p className="text-sm text-[#F5F3ED] leading-relaxed italic font-normal mb-6">
                  &ldquo;{card.quote}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-[#D6A85F]/15 flex items-center gap-3">
                <img
                  src={card.avatar}
                  alt={card.author}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-[#0B1727] group-hover:scale-105 transition-transform"
                />
                <div>
                  <h5 className="text-xs font-semibold text-[#F5F3ED] group-hover:text-[#D6A85F] transition-colors">
                    {card.author}
                  </h5>
                  <p className="text-[11px] text-[#9BA9B8]">
                    {card.title}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

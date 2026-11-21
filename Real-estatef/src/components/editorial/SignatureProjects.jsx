import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useScrollDirection } from "../../hooks/useScrollDirection";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  MapPin,
  TrendingUp,
  Compass,
  CheckCircle2,
  Activity,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  Eye,
  DollarSign,
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

// Interactive Data Items
const ALL_PORTFOLIO_PROPERTIES = [
  {
    id: "horizon",
    code: "00",
    name: "The Horizon Residence",
    category: "RESIDENTIAL",
    location: "Kolkata · West Bengal",
    city: "Kolkata",
    price: "₹4.85 Cr",
    priceRaw: 4.85,
    specs: "4 BED · 4 BATH · 3,850 SQ.FT",
    status: "AVAILABLE",
    statusType: "available",
    roi: "+18.6%",
    score: 92,
    scoreLabel: "HIGH POTENTIAL",
    type: "Penthouse Villa",
    image: "/images/about/enterprise-luxury-property.jpg",
    isFeatured: true,
  },
  {
    id: "monolith",
    code: "01",
    name: "The Monolith Villa",
    category: "RESIDENTIAL",
    location: "Algarve, Portugal",
    city: "International",
    price: "₹3.20 Cr",
    priceRaw: 3.20,
    specs: "3 BED · 3.5 BATH · 2,900 SQ.FT",
    status: "AVAILABLE",
    statusType: "available",
    roi: "+14.2%",
    score: 88,
    scoreLabel: "CAPITAL ASSET",
    type: "Cliffside Compound",
    image: "/images/about/bluehour-modern-estate.jpg",
  },
  {
    id: "skyline",
    code: "02",
    name: "Skyline Residences",
    category: "RESIDENTIAL",
    location: "Mumbai, India",
    city: "Mumbai",
    price: "₹2.85 Cr",
    priceRaw: 2.85,
    specs: "3 BED · 3 BATH · 2,400 SQ.FT",
    status: "NEW LISTING",
    statusType: "new",
    roi: "+21.4%",
    score: 95,
    scoreLabel: "PRIME APPRECIATION",
    type: "High-Rise Sky Residence",
    image: "/hero-building-4k.jpg",
  },
  {
    id: "parkside",
    code: "03",
    name: "Parkside Estate",
    category: "INVESTMENT",
    location: "Kolkata, India",
    city: "Kolkata",
    price: "₹1.95 Cr",
    priceRaw: 1.95,
    specs: "5 BED · 5 BATH · 4,200 SQ.FT",
    status: "UNDER REVIEW",
    statusType: "review",
    roi: "+16.8%",
    score: 86,
    scoreLabel: "ESCROW CLEARING",
    type: "Gated Estate",
    image: "/images/about/about-villa.jpg",
  },
  {
    id: "courtyard",
    code: "04",
    name: "The Courtyard",
    category: "COMMERCIAL",
    location: "Delhi, India",
    city: "Delhi",
    price: "₹2.40 Cr",
    priceRaw: 2.40,
    specs: "COMMERCIAL ATELIER · 3,100 SQ.FT",
    status: "SOLD",
    statusType: "sold",
    roi: "+19.0%",
    score: 91,
    scoreLabel: "REGISTRY EXECUTED",
    type: "Boutique Headquarters",
    image: "/properties/commercial.png",
  },
];

// Prime Location Map Pins
const MAP_LOCATIONS = [
  {
    id: "loc-kolkata",
    city: "Kolkata",
    state: "West Bengal",
    propertiesCount: "34 Active",
    volume: "₹38.2 Cr",
    x: 46, // map percentage x
    y: 44, // map percentage y
    highlightProperty: {
      name: "The Horizon Residence",
      price: "₹4.85 Cr",
      specs: "4 Beds · 3,850 sqft",
      status: "Available",
      img: "/images/about/enterprise-luxury-property.jpg",
    },
  },
  {
    id: "loc-mumbai",
    city: "Mumbai",
    state: "Maharashtra",
    propertiesCount: "68 Active",
    volume: "₹84.6 Cr",
    x: 32,
    y: 56,
    highlightProperty: {
      name: "Skyline Residences",
      price: "₹2.85 Cr",
      specs: "3 Beds · 2,400 sqft",
      status: "New Listing",
      img: "/hero-building-4k.jpg",
    },
  },
  {
    id: "loc-delhi",
    city: "Delhi",
    state: "NCR",
    propertiesCount: "52 Active",
    volume: "₹62.0 Cr",
    x: 34,
    y: 30,
    highlightProperty: {
      name: "The Courtyard Commercial",
      price: "₹2.40 Cr",
      specs: "Grade A · 3,100 sqft",
      status: "Sold",
      img: "/properties/commercial.png",
    },
  },
  {
    id: "loc-bangalore",
    city: "Bangalore",
    state: "Karnataka",
    propertiesCount: "44 Active",
    volume: "₹49.5 Cr",
    x: 36,
    y: 72,
    highlightProperty: {
      name: "Greenfield Tech Villa",
      price: "₹3.60 Cr",
      specs: "4 Beds · 3,600 sqft",
      status: "Available",
      img: "/images/about/bluehour-modern-estate.jpg",
    },
  },
  {
    id: "loc-dubai",
    city: "Dubai",
    state: "UAE Prime Zone",
    propertiesCount: "50 Active",
    volume: "₹120+ Cr",
    x: 18,
    y: 38,
    highlightProperty: {
      name: "Marina Palm Penthouse",
      price: "₹12.4 Cr",
      specs: "5 Beds · 6,200 sqft",
      status: "Prime Investment",
      img: "/images/about/bluehour-modern-estate.jpg",
    },
  },
];

export default function SignatureProjects({ onOpenEnquiry }) {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.15 });
  const shouldReduceMotion = useReducedMotion();
  const { scrollDirection } = useScrollDirection();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const gridParallaxY = useTransform(scrollYProgress, [0, 1], [-25, 25]);

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

  // Filter States
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activeMapLoc, setActiveMapLoc] = useState(MAP_LOCATIONS[0]);

  const categories = ["ALL", "RESIDENTIAL", "COMMERCIAL", "INVESTMENT"];

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return ALL_PORTFOLIO_PROPERTIES.filter((p) => {
      const matchCat = activeCategory === "ALL" || p.category === activeCategory;
      const matchStatus = statusFilter === "ALL" || p.statusType === statusFilter;
      return matchCat && matchStatus;
    });
  }, [activeCategory, statusFilter]);

  const featuredProperty = ALL_PORTFOLIO_PROPERTIES[0];
  const secondaryProperties = ALL_PORTFOLIO_PROPERTIES.slice(1);

  return (
    <section
      id="projects"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="scroll-mt-20 relative py-24 sm:py-32 lg:py-36 bg-[#07111F] text-[#F5F3ED] overflow-hidden selection:bg-[#D6A85F] selection:text-[#07111F] border-b border-[#D6A85F]/20"
    >
      {/* 1. MOUSE-FOLLOWING SPOTLIGHT (CHAMPAGNE GOLD & MUTED BLUE GLOW) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-700 opacity-60"
        style={{
          background: `radial-gradient(900px circle at ${mousePos.x}px ${mousePos.y}px, rgba(214,168,95,0.06), rgba(111,155,184,0.04) 45%, transparent 75%)`,
        }}
      />

      {/* 2. ARCHITECTURAL MASTERPLAN DRAFTING GRID */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-70"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, rgba(111,155,184,0.05) 0%, transparent 60%),
            radial-gradient(circle at 20% 80%, rgba(214,168,95,0.04) 0%, transparent 65%)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================= */}
        {/* HERO HEADER: EDITORIAL TYPOGRAPHY & VIEW ALL BUTTON       */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#D6A85F]/20 mb-8">
          <div className="max-w-3xl">
            {/* Small Uppercase Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#102238] border border-[#D6A85F]/25 mb-4 shadow-[0_2px_12px_rgba(7,17,31,0.5)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A85F] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-mono font-semibold text-[#D6A85F]">
                PROPERTY PORTFOLIO
              </span>
              <span className="text-[#6F9BB8] text-[10px] font-mono border-l border-[#D6A85F]/20 pl-2">
                ACTIVE ASSETS
              </span>
            </div>

            {/* Main Editorial Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-5xl md:text-[54px] font-medium tracking-tight text-[#F5F3ED] leading-[1.14]"
            >
              A Portfolio Built Around{" "}
              <span className="font-editorial italic font-normal text-[#D6A85F]">
                Possibility.
              </span>
            </motion.h2>

            {/* Supporting Text */}
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 text-sm sm:text-base text-[#9BA9B8] leading-relaxed max-w-2xl"
            >
              Explore a curated portfolio of residential, commercial and investment properties
              managed through one intelligent real-estate platform.
            </motion.p>
          </div>

          {/* Right Action: VIEW ALL PROPERTIES Button */}
          <div className="shrink-0">
            <button
              onClick={() => navigate("/properties")}
              className="group relative inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#102238] border border-[#D6A85F]/40 text-xs sm:text-sm font-semibold tracking-wider text-[#F5F3ED] hover:text-[#D6A85F] hover:border-[#D6A85F] transition-all duration-300 shadow-[0_4px_20px_rgba(7,17,31,0.6)] cursor-pointer overflow-hidden"
            >
              {/* Subtle animated light sweep on hover */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D6A85F]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
              <span>VIEW ALL PROPERTIES</span>
              <ArrowRight className="w-4 h-4 text-[#D6A85F] transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* HORIZONTAL PROPERTY INTELLIGENCE BAR (METRICS STRIP)      */}
        {/* 248 PROPERTIES | 42 ACTIVE | 18 SOLD | ₹8.4Cr | 12 LOCS  */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl bg-[#0C1929] border border-[#D6A85F]/20 p-4 sm:p-5 mb-10 shadow-lg"
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#D6A85F]/15">
            {/* Metric 1 */}
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:pr-4 pt-1 sm:pt-0">
              <span className="font-editorial text-2xl sm:text-3xl text-[#F5F3ED] font-normal">
                <CountUpNumber end={248} />
              </span>
              <div className="text-left">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#6F9BB8] block">
                  PROPERTIES
                </span>
                <span className="text-[10px] text-[#9BA9B8]">Managed in platform</span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:px-4 pt-2 sm:pt-0">
              <span className="font-editorial text-2xl sm:text-3xl text-[#D6A85F] font-normal">
                <CountUpNumber end={42} />
              </span>
              <div className="text-left">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#6F9BB8] block">
                  ACTIVE
                </span>
                <span className="text-[10px] text-[#6FA58A]">Available for acquisition</span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:px-4 pt-2 sm:pt-0">
              <span className="font-editorial text-2xl sm:text-3xl text-[#F5F3ED] font-normal">
                <CountUpNumber end={18} />
              </span>
              <div className="text-left">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#6F9BB8] block">
                  SOLD
                </span>
                <span className="text-[10px] text-[#9BA9B8]">Q4 Settled Contracts</span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:px-4 pt-2 sm:pt-0">
              <span className="font-editorial text-2xl sm:text-3xl text-[#D6A85F] font-normal">
                ₹8.4Cr
              </span>
              <div className="text-left">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#6F9BB8] block">
                  PORTFOLIO
                </span>
                <span className="text-[10px] text-[#D6A85F]">Active Capitalization</span>
              </div>
            </div>

            {/* Metric 5 */}
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:pl-4 pt-2 sm:pt-0 col-span-2 sm:col-span-1">
              <span className="font-editorial text-2xl sm:text-3xl text-[#F5F3ED] font-normal">
                <CountUpNumber end={12} />
              </span>
              <div className="text-left">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#6F9BB8] block">
                  LOCATIONS
                </span>
                <span className="text-[10px] text-[#6FA58A]">Prime Metros &amp; Coastal</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ========================================================= */}
        {/* ADVANCED FILTER BAR                                       */}
        {/* Interactive Floating Filter Tabs & Dropdowns             */}
        {/* ========================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10 pb-4 border-b border-[#D6A85F]/15">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0C1929] border border-[#D6A85F]/20">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg text-[11px] font-mono tracking-wider font-semibold transition-all duration-300 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-[#D6A85F] text-[#07111F] shadow-md"
                    : "text-[#9BA9B8] hover:text-[#F5F3ED]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Quick Filters */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#6F9BB8] hidden sm:inline text-[11px]">STATUS:</span>
            {["ALL", "available", "new", "sold"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#142A42] text-[#D6A85F] border border-[#D6A85F]/35"
                    : "bg-[#0C1929] text-[#9BA9B8] border border-transparent hover:text-[#F5F3ED]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN FEATURED PROPERTY & ASYMMETRIC SECONDARY GRID        */}
        {/* 60–65% Width Primary Card + 4 Editorial Modules           */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
          
          {/* ======================================================= */}
          {/* LEFT: MAIN FEATURED PROPERTY (60-65% WIDTH / COLS 1-7)  */}
          {/* ======================================================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 35 }}
            animate={inView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.94, y: 35 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative group"
          >
            <div className="relative rounded-3xl bg-[#102238] border border-[#D6A85F]/25 overflow-hidden shadow-[0_20px_60px_rgba(7,17,31,0.8)] transition-all duration-500 hover:border-[#D6A85F]/50">
              
              {/* Primary Image Container */}
              <div className="relative w-full aspect-[16/11] sm:aspect-[16/10] overflow-hidden bg-[#0C1929]">
                <img
                  src={featuredProperty.image}
                  alt={featuredProperty.name}
                  className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05] transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Dark Cinematic Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-[#07111F]/30 to-transparent pointer-events-none" />

                {/* Top Badge: FEATURED PROPERTY */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0C1929]/88 backdrop-blur-md border border-[#D6A85F]/30 shadow-lg text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D6A85F] animate-ping" />
                  <span className="font-semibold tracking-wider text-[#D6A85F] uppercase">
                    FEATURED PROPERTY
                  </span>
                  <span className="text-[#6F9BB8] border-l border-[#D6A85F]/20 pl-1.5">
                    RERA VERIFIED
                  </span>
                </div>

                {/* Top-Right: Rotating Circular Arrow Action */}
                <button
                  onClick={() => onOpenEnquiry && onOpenEnquiry(`Inquiry: ${featuredProperty.name}`)}
                  aria-label="View property details"
                  className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-[#102238]/90 backdrop-blur-md border border-[#D6A85F]/30 text-[#D6A85F] flex items-center justify-center transition-all duration-300 group-hover:rotate-45 group-hover:bg-[#D6A85F] group-hover:text-[#07111F] shadow-lg cursor-pointer"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </button>

                {/* Bottom Main Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0C1929]/90 backdrop-blur-xl border border-[#D6A85F]/25">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-mono text-[#6F9BB8] mb-1">
                          <MapPin className="w-3.5 h-3.5 text-[#D6A85F]" />
                          <span>{featuredProperty.location}</span>
                        </div>
                        <h3 className="font-editorial text-2xl sm:text-3xl text-[#F5F3ED] font-medium tracking-tight">
                          {featuredProperty.name}
                        </h3>
                        <p className="text-xs text-[#9BA9B8] font-mono mt-1">
                          {featuredProperty.specs}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono text-[#6F9BB8] block">
                          ACQUISITION VALUE
                        </span>
                        <span className="text-2xl sm:text-3xl font-bold text-[#D6A85F] font-mono">
                          {featuredProperty.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FLOATING PROPERTY INTELLIGENCE DATA PANEL (OVERLAPPING BOTTOM) */}
              <div className="p-4 sm:p-6 bg-[#102238] border-t border-[#D6A85F]/15">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#D6A85F]/15">
                  {/* Item 1 */}
                  <div className="pt-1 sm:pt-0 sm:pr-3">
                    <span className="text-[9.5px] uppercase font-mono tracking-wider text-[#6F9BB8] block">
                      PROPERTY VALUE
                    </span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-[#F5F3ED]">
                      {featuredProperty.price}
                    </span>
                    <span className="text-[10px] text-[#6FA58A] block font-mono">Title Insured</span>
                  </div>

                  {/* Item 2 */}
                  <div className="pt-2 sm:pt-0 sm:px-3">
                    <span className="text-[9.5px] uppercase font-mono tracking-wider text-[#6F9BB8] block">
                      EST. ROI
                    </span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-[#6FA58A]">
                      {featuredProperty.roi}
                    </span>
                    <span className="text-[10px] text-[#9BA9B8] block font-mono">Annualized Yield</span>
                  </div>

                  {/* Item 3 */}
                  <div className="pt-2 sm:pt-0 sm:px-3">
                    <span className="text-[9.5px] uppercase font-mono tracking-wider text-[#6F9BB8] block">
                      STATUS
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#D6A85F] mt-1">
                      <span className="w-2 h-2 rounded-full bg-[#6FA58A]" />
                      {featuredProperty.status}
                    </span>
                    <span className="text-[10px] text-[#6F9BB8] block font-mono">Immediate Handover</span>
                  </div>

                  {/* Item 4: Investment Score Visualization */}
                  <div className="pt-2 sm:pt-0 sm:pl-3">
                    <span className="text-[9.5px] uppercase font-mono tracking-wider text-[#6F9BB8] block">
                      INVESTMENT SCORE
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-lg sm:text-xl font-bold font-mono text-[#D6A85F]">
                        {featuredProperty.score}
                      </span>
                      <span className="text-[10px] font-mono text-[#9BA9B8]">/ 100</span>
                    </div>
                    {/* Animated Progress Bar */}
                    <div className="h-1.5 w-full bg-[#0C1929] rounded-full overflow-hidden mt-1">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#D6A85F] to-[#E8C985]"
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${featuredProperty.score}%` } : { width: 0 }}
                        transition={{ duration: 1.2, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          {/* ======================================================= */}
          {/* RIGHT: ASYMMETRIC SECONDARY PROPERTY GRID (COLS 8-12)   */}
          {/* 4 Distinct Editorial Property Modules                   */}
          {/* ======================================================= */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
            {secondaryProperties.map((prop, idx) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={inView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 30, scale: 0.95 }}
                transition={{ duration: 0.6, delay: 0.12 * idx, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-2xl bg-[#102238] border border-[#D6A85F]/20 p-3 sm:p-4 shadow-md hover:border-[#D6A85F]/40 transition-all duration-300"
              >
                <div className="flex gap-4 items-center">
                  {/* Thumbnail Image */}
                  <div className="relative w-28 sm:w-32 h-24 rounded-xl overflow-hidden shrink-0 bg-[#0C1929]">
                    <img
                      src={prop.image}
                      alt={prop.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-[#07111F]/85 text-[8.5px] font-mono text-[#D6A85F] border border-[#D6A85F]/20">
                      {prop.code}
                    </div>
                  </div>

                  {/* Info Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono text-[#6F9BB8] truncate">
                        {prop.location}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded ${
                          prop.statusType === "available"
                            ? "bg-[#6FA58A]/15 text-[#6FA58A] border border-[#6FA58A]/30"
                            : prop.statusType === "new"
                            ? "bg-[#D6A85F]/15 text-[#D6A85F] border border-[#D6A85F]/30"
                            : prop.statusType === "sold"
                            ? "bg-[#9BA9B8]/15 text-[#9BA9B8] border border-[#9BA9B8]/30"
                            : "bg-[#142A42] text-[#E8C985] border border-[#E8C985]/30"
                        }`}
                      >
                        {prop.status}
                      </span>
                    </div>

                    <h4 className="font-editorial text-base sm:text-lg text-[#F5F3ED] font-medium truncate group-hover:text-[#D6A85F] transition-colors">
                      {prop.name}
                    </h4>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#D6A85F]/15">
                      <span className="text-sm font-bold font-mono text-[#D6A85F]">
                        {prop.price}
                      </span>
                      <button
                        onClick={() => onOpenEnquiry && onOpenEnquiry(`Inquiry: ${prop.name}`)}
                        className="text-[10px] font-mono text-[#6F9BB8] hover:text-[#F5F3ED] flex items-center gap-1 cursor-pointer"
                      >
                        <span>INSPECT</span>
                        <ArrowRight className="w-3 h-3 text-[#D6A85F]" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE PROPERTY MAP: PROPERTIES ACROSS PRIME LOCS    */}
        {/* Full-width dark map interface with markers and previews  */}
        {/* ========================================================= */}
        <div className="mb-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-[0.24em] text-[#D6A85F] font-semibold block mb-1">
                GEOGRAPHIC DISTRIBUTION
              </span>
              <h3 className="font-editorial text-2xl sm:text-3xl text-[#F5F3ED]">
                Properties Across Prime Locations
              </h3>
            </div>
            <div className="text-xs font-mono text-[#6F9BB8]">
              ACTIVE CLUSTERS: KOLKATA • MUMBAI • DELHI • BANGALORE • DUBAI
            </div>
          </div>

          {/* Map Interactive Canvas */}
          <div className="relative rounded-3xl bg-[#091524] border border-[#D6A85F]/25 overflow-hidden shadow-[0_20px_50px_rgba(7,17,31,0.8)] min-h-[380px] sm:min-h-[460px] p-4 sm:p-6 flex flex-col justify-between">
            
            {/* SVG Dark Spatial Route & City Map */}
            <svg viewBox="0 0 1000 500" className="absolute inset-0 w-full h-full pointer-events-none select-none opacity-40">
              {/* Land / coast silhouette line */}
              <path
                d="M 50 150 Q 200 120 350 200 T 650 320 T 950 240"
                stroke="#6F9BB8"
                strokeWidth="1.2"
                strokeDasharray="6 4"
                fill="none"
              />
              <path
                d="M 120 450 C 300 350, 600 480, 850 200"
                stroke="#D6A85F"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.5"
                fill="none"
              />
              {/* City grid lines */}
              {Array.from({ length: 11 }).map((_, i) => (
                <line key={`mx-${i}`} x1={i * 90 + 50} y1="30" x2={i * 90 + 50} y2="470" stroke="#6F9BB8" strokeWidth="0.5" strokeOpacity="0.2" />
              ))}
              {Array.from({ length: 6 }).map((_, j) => (
                <line key={`my-${j}`} x1="50" y1={j * 80 + 40} x2="950" y2={j * 80 + 40} stroke="#6F9BB8" strokeWidth="0.5" strokeOpacity="0.2" />
              ))}
            </svg>

            {/* City Map Pins */}
            {MAP_LOCATIONS.map((loc) => {
              const isActive = activeMapLoc.id === loc.id;
              return (
                <div
                  key={loc.id}
                  onClick={() => setActiveMapLoc(loc)}
                  onMouseEnter={() => setActiveMapLoc(loc)}
                  style={{
                    left: `${loc.x}%`,
                    top: `${loc.y}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer group/pin"
                >
                  {/* Pulsing ring */}
                  <span
                    className={`absolute -inset-3 rounded-full transition-all duration-300 ${
                      isActive
                        ? "bg-[#D6A85F]/35 animate-ping"
                        : "bg-[#6F9BB8]/20 group-hover/pin:bg-[#D6A85F]/30 animate-pulse"
                    }`}
                  />
                  {/* Pin Circle */}
                  <div
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                      isActive
                        ? "bg-[#D6A85F] text-[#07111F] ring-4 ring-[#D6A85F]/30 scale-115 font-bold"
                        : "bg-[#102238] border border-[#D6A85F]/40 text-[#D6A85F] group-hover/pin:scale-110"
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  {/* Pin City Label */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded bg-[#07111F]/90 border border-[#D6A85F]/20 text-[9.5px] font-mono text-[#F5F3ED] whitespace-nowrap shadow-md pointer-events-none">
                    {loc.city}
                  </div>
                </div>
              );
            })}

            {/* Hover Floating Property Preview Box */}
            <div className="relative z-40 max-w-sm rounded-2xl bg-[#0C1929]/95 backdrop-blur-xl border border-[#D6A85F]/30 p-4 shadow-[0_20px_40px_rgba(7,17,31,0.85)] mt-auto sm:mt-0 sm:self-end">
              <div className="flex items-center gap-3">
                <img
                  src={activeMapLoc.highlightProperty.img}
                  alt={activeMapLoc.highlightProperty.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-[#D6A85F]/25"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[10px] font-mono text-[#D6A85F] uppercase font-bold">
                      {activeMapLoc.city} • {activeMapLoc.state}
                    </span>
                    <span className="text-[10px] font-mono text-[#6FA58A]">
                      {activeMapLoc.highlightProperty.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-[#F5F3ED] truncate">
                    {activeMapLoc.highlightProperty.name}
                  </h4>
                  <div className="text-xs font-bold text-[#D6A85F] font-mono mt-0.5">
                    {activeMapLoc.highlightProperty.price}
                  </div>
                  <p className="text-[9.5px] text-[#9BA9B8] font-mono">
                    {activeMapLoc.highlightProperty.specs}
                  </p>
                </div>
              </div>
            </div>

            {/* Map Telemetry Footer */}
            <div className="relative z-20 pt-3 border-t border-[#D6A85F]/15 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#6F9BB8]">
              <div className="flex items-center gap-4">
                <span>TOTAL ASSET PIPELINE: {activeMapLoc.volume}</span>
                <span>•</span>
                <span>{activeMapLoc.propertiesCount}</span>
              </div>
              <span className="text-[#D6A85F]">CLICK ANY CITY TO INSPECT CLUSTER</span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

import React, { useState, useEffect, useRef } from "react";
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
  Bed,
  Bath,
  Maximize2,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Eye,
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

// Fallback curated showcase export for Properties and PropertyDetails pages
export const CURATED_PROPERTIES = [
  {
    _id: "prop-curated-1",
    id: "prop-curated-1",
    propertyId: "PROP-000106",
    title: "Jubilee Grand Contemporary Mansion",
    category: "Signature Villa",
    listingType: "Sale",
    city: "Hyderabad, Telangana",
    address: "Road 36, Jubilee Hills",
    price: 290000000,
    formattedPrice: "₹29.00 Cr",
    bedrooms: 6,
    bathrooms: 7,
    area: 9200,
    images: ["/images/about/enterprise-luxury-property.jpg"],
    description: "Ultra-luxury cubic architectural mansion with private infinity reflection pool, double-height ceiling volumes, and smart climate integration.",
    badge: "Curated Edition",
    isFeatured: true,
  },
  {
    _id: "prop-curated-2",
    id: "prop-curated-2",
    propertyId: "PROP-000107",
    title: "Skyline Ultra Penthouse",
    category: "Luxury Penthouse",
    listingType: "Sale",
    city: "Worli, Mumbai",
    address: "Worli Sea Face, Tower 1",
    price: 240000000,
    formattedPrice: "₹24.00 Cr",
    bedrooms: 4,
    bathrooms: 5,
    area: 6400,
    images: ["/hero-building-4k.jpg"],
    description: "Duplex sky residence offering panoramic Arabian Sea vistas, private plunge terrace, and dedicated concierge elevators.",
    badge: "Exclusive Launch",
    isFeatured: true,
  },
  {
    _id: "prop-curated-3",
    id: "prop-curated-3",
    propertyId: "PROP-000108",
    title: "The Glass Horizon Pavilion",
    category: "Modernist Residence",
    listingType: "Sale",
    city: "Ballygunge, Kolkata",
    address: "Ballygunge Circular Road",
    price: 185000000,
    formattedPrice: "₹18.50 Cr",
    bedrooms: 5,
    bathrooms: 5,
    area: 5800,
    images: ["/images/about/bluehour-modern-estate.jpg"],
    description: "Floor-to-ceiling minimal mullion glass membranes framing private landscaped gardens and infinity reflection pool.",
    badge: "Architectural Award",
    isFeatured: true,
  },
  {
    _id: "prop-curated-4",
    id: "prop-curated-4",
    propertyId: "PROP-000109",
    title: "Apex Horizon Headquarters",
    category: "Commercial Atelier",
    listingType: "Sale",
    city: "Barakhamba, Delhi NCR",
    address: "Connaught Place Financial Outer Ring",
    price: 345000000,
    formattedPrice: "₹34.50 Cr",
    bedrooms: 0,
    bathrooms: 8,
    area: 18400,
    images: ["/properties/commercial.png"],
    description: "Grade A corporate headquarters with private executive terraces, multi-vehicle subterranean parking, and high-security access.",
    badge: "Commercial Edition",
    isFeatured: true,
  },
  {
    _id: "prop-curated-5",
    id: "prop-curated-5",
    propertyId: "PROP-000110",
    title: "The Alcove Biophilic Sanctuary",
    category: "Biophilic Compound",
    listingType: "Sale",
    city: "Indiranagar, Bangalore",
    address: "Defense Colony Park Avenue",
    price: 142000000,
    formattedPrice: "₹14.20 Cr",
    bedrooms: 4,
    bathrooms: 4.5,
    area: 4900,
    images: ["/images/about/about-villa.jpg"],
    description: "Biophilic compound woven with native flora, geothermal thermal sinks, and discreet smart security ledgers.",
    badge: "Investment Grade",
    isFeatured: true,
  },
];


// 5 Intelligence Portfolio Items (Mapped to Navigation Rail Categories)
const INTELLIGENCE_PROPERTIES = [
  {
    categoryIndex: 0,
    categoryName: "FEATURED",
    id: "prop-01",
    propertyId: "PROP-000106",
    title: "Jubilee Grand Contemporary Mansion",
    city: "Hyderabad · Telangana",
    price: "₹29.00 Cr",
    priceRaw: 29.0,
    valuationNum: 29.0,
    appreciation: "+18.6%",
    growthVal: 18.6,
    score: 92,
    scoreLabel: "HIGH POTENTIAL",
    status: "AVAILABLE",
    statusType: "available",
    beds: 6,
    baths: 7,
    area: "9,200 sq.ft",
    coordinates: "17°25'N 78°24'E",
    cityMarker: "HYDERABAD",
    mapX: 48,
    mapY: 58,
    nearbyCount: 14,
    avgNearbyValue: "₹8.2 Cr",
    image: "/images/about/enterprise-luxury-property.jpg",
    specs: "6 Beds · 7 Baths · 9,200 sq.ft",
    chartPoints: [18, 22, 24, 26, 29],
  },
  {
    categoryIndex: 1,
    categoryName: "VILLAS",
    id: "prop-02",
    propertyId: "PROP-000107",
    title: "Skyline Ultra Penthouse",
    city: "Worli · Mumbai",
    price: "₹24.00 Cr",
    priceRaw: 24.0,
    valuationNum: 24.0,
    appreciation: "+22.4%",
    growthVal: 22.4,
    score: 96,
    scoreLabel: "TROPHY ASSET",
    status: "AVAILABLE",
    statusType: "available",
    beds: 4,
    baths: 5,
    area: "6,400 sq.ft",
    coordinates: "18°59'N 72°50'E",
    cityMarker: "MUMBAI",
    mapX: 30,
    mapY: 52,
    nearbyCount: 22,
    avgNearbyValue: "₹16.5 Cr",
    image: "/hero-building-4k.jpg",
    specs: "4 Beds · 5 Baths · 6,400 sq.ft",
    chartPoints: [16, 18, 20, 22, 24],
  },
  {
    categoryIndex: 2,
    categoryName: "APARTMENTS",
    id: "prop-03",
    propertyId: "PROP-000108",
    title: "The Glass Horizon Pavilion",
    city: "Ballygunge · Kolkata",
    price: "₹18.50 Cr",
    priceRaw: 18.5,
    valuationNum: 18.5,
    appreciation: "+14.8%",
    growthVal: 14.8,
    score: 89,
    scoreLabel: "STABLE CAPITAL",
    status: "RESERVED",
    statusType: "reserved",
    beds: 5,
    baths: 5,
    area: "5,800 sq.ft",
    coordinates: "22°34'N 88°21'E",
    cityMarker: "KOLKATA",
    mapX: 72,
    mapY: 42,
    nearbyCount: 9,
    avgNearbyValue: "₹6.4 Cr",
    image: "/images/about/bluehour-modern-estate.jpg",
    specs: "5 Beds · 5 Baths · 5,800 sq.ft",
    chartPoints: [14, 15, 16, 17, 18.5],
  },
  {
    categoryIndex: 3,
    categoryName: "COMMERCIAL",
    id: "prop-04",
    propertyId: "PROP-000109",
    title: "Apex Horizon Headquarters",
    city: "Barakhamba · Delhi NCR",
    price: "₹34.50 Cr",
    priceRaw: 34.5,
    valuationNum: 34.5,
    appreciation: "+19.2%",
    growthVal: 19.2,
    score: 94,
    scoreLabel: "INSTITUTIONAL GRADE",
    status: "AVAILABLE",
    statusType: "available",
    beds: "Grade A",
    baths: "Multi-Suite",
    area: "18,400 sq.ft",
    coordinates: "28°36'N 77°12'E",
    cityMarker: "DELHI",
    mapX: 42,
    mapY: 26,
    nearbyCount: 31,
    avgNearbyValue: "₹22.0 Cr",
    image: "/properties/commercial.png",
    specs: "Commercial HQ · 18,400 sq.ft",
    chartPoints: [24, 26, 29, 31, 34.5],
  },
  {
    categoryIndex: 4,
    categoryName: "INVESTMENT",
    id: "prop-05",
    propertyId: "PROP-000110",
    title: "The Alcove Biophilic Sanctuary",
    city: "Indiranagar · Bangalore",
    price: "₹14.20 Cr",
    priceRaw: 14.2,
    valuationNum: 14.2,
    appreciation: "+26.5%",
    growthVal: 26.5,
    score: 95,
    scoreLabel: "HIGH VELOCITY",
    status: "SOLD",
    statusType: "sold",
    beds: 4,
    baths: 4.5,
    area: "4,900 sq.ft",
    coordinates: "12°58'N 77°35'E",
    cityMarker: "BANGALORE",
    mapX: 46,
    mapY: 76,
    nearbyCount: 18,
    avgNearbyValue: "₹5.8 Cr",
    image: "/images/about/about-villa.jpg",
    specs: "4 Beds · 4.5 Baths · 4,900 sq.ft",
    chartPoints: [9, 10, 11, 12.5, 14.2],
  },
];

export default function SelectedProperties({ onOpenEnquiry }) {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: false, amount: 0.15 });
  const shouldReduceMotion = useReducedMotion();
  const { scrollDirection } = useScrollDirection();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const blueprintParallaxY = useTransform(scrollYProgress, [0, 1], [-25, 25]);

  // Active Selected Hero Property
  const [activePropertyIndex, setActivePropertyIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

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

  // Switch Active Property with signature 750ms Property Scan Animation
  const handleSelectProperty = (newIndex) => {
    if (newIndex === activePropertyIndex) return;
    setIsScanning(true);
    setTimeout(() => {
      setActivePropertyIndex(newIndex);
    }, 280);
    setTimeout(() => {
      setIsScanning(false);
    }, 750);
  };

  const activeProp = INTELLIGENCE_PROPERTIES[activePropertyIndex];

  // Secondary Stack (All properties excluding the active hero)
  const stackedProperties = INTELLIGENCE_PROPERTIES.filter(
    (_, idx) => idx !== activePropertyIndex
  ).slice(0, 3);

  return (
    <section
      id="properties"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="scroll-mt-20 relative py-24 sm:py-32 lg:py-36 bg-[#07111F] text-[#F5F3ED] overflow-hidden selection:bg-[#D6A85F] selection:text-[#07111F] border-b border-[#D6A85F]/20"
    >
      {/* 1. MOUSE-FOLLOWING SPOTLIGHT */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-700 opacity-60"
        style={{
          background: `radial-gradient(900px circle at ${mousePos.x}px ${mousePos.y}px, rgba(214,168,95,0.06), rgba(111,155,184,0.04) 45%, transparent 75%)`,
        }}
      />

      {/* 2. ARCHITECTURAL DRAFTING BLUEPRINT WIREFRAME BACKGROUND */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px),
            radial-gradient(circle at 85% 25%, rgba(111,155,184,0.06) 0%, transparent 60%),
            radial-gradient(circle at 15% 75%, rgba(214,168,95,0.05) 0%, transparent 65%)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================= */}
        {/* 1. HEADER: CONCEPT "PROPERTY INTELLIGENCE"                */}
        {/* ========================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#D6A85F]/20 mb-10">
          <div className="max-w-2xl">
            {/* Small Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#102238] border border-[#D6A85F]/25 mb-4 shadow-[0_2px_12px_rgba(7,17,31,0.5)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A85F] animate-pulse" />
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.28em] font-mono font-semibold text-[#D6A85F]">
                PROPERTY INTELLIGENCE / 01
              </span>
              <span className="text-[#6F9BB8] text-[10px] font-mono border-l border-[#D6A85F]/20 pl-2">
                ACTIVE PORTFOLIO
              </span>
            </div>

            {/* Main Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-5xl md:text-[54px] font-medium tracking-tight text-[#F5F3ED] leading-[1.12]"
            >
              Discover Properties <br />
              <span className="font-editorial italic font-normal text-[#D6A85F]">
                With More To See.
              </span>
            </motion.h2>

            {/* Supporting Copy */}
            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 text-sm sm:text-base text-[#9BA9B8] leading-relaxed"
            >
              Explore high-value properties through location intelligence, market data,
              availability and investment potential — all from one platform.
            </motion.p>
          </div>

          {/* Right Statistics Strip */}
          <div className="flex items-center gap-6 sm:gap-8 pt-2 lg:pt-0">
            <div>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#F5F3ED] block">
                <CountUpNumber end={248} />
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#6F9BB8]">
                PROPERTIES
              </span>
            </div>
            <div className="h-8 w-[1px] bg-[#D6A85F]/25" />
            <div>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#D6A85F] block">
                <CountUpNumber end={18} />
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#6F9BB8]">
                LOCATIONS
              </span>
            </div>
            <div className="h-8 w-[1px] bg-[#D6A85F]/25" />
            <div>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-[#6FA58A] block">
                <CountUpNumber end={42} />
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#6FA58A]">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN ASYMMETRIC COMPOSITION: RAIL + HERO + SIDE STACK     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* ======================================================= */}
          {/* 6. VERTICAL NAVIGATION RAIL (COLS 1)                    */}
          {/* 01 FEATURED • 02 VILLAS • 03 APARTMENTS • 04 COMM...    */}
          {/* ======================================================= */}
          <div className="lg:col-span-1 hidden lg:flex flex-col space-y-6 pt-4 border-r border-[#D6A85F]/15 pr-4">
            {INTELLIGENCE_PROPERTIES.map((prop, idx) => {
              const isActive = idx === activePropertyIndex;
              return (
                <button
                  key={prop.id}
                  onClick={() => handleSelectProperty(idx)}
                  className={`group text-left transition-all duration-300 cursor-pointer relative pl-3 ${
                    isActive ? "scale-105" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* Active Indicator Champagne Line */}
                  <span
                    className={`absolute left-0 top-1 bottom-1 w-[2.5px] rounded-full transition-all duration-300 ${
                      isActive ? "bg-[#D6A85F] shadow-[0_0_8px_rgba(214,168,95,0.8)]" : "bg-transparent group-hover:bg-[#D6A85F]/30"
                    }`}
                  />
                  <span className="text-[10px] font-mono text-[#6F9BB8] block">
                    0{idx + 1}
                  </span>
                  <span
                    className={`text-xs font-mono tracking-wider font-semibold uppercase block ${
                      isActive ? "text-[#D6A85F]" : "text-[#F5F3ED]"
                    }`}
                  >
                    {prop.categoryName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ======================================================= */}
          {/* 3. HERO FEATURED PROPERTY (~65-70% / COLS 2-8)          */}
          {/* Cinematic Hero Image with Overlapping Intelligence Panel*/}
          {/* ======================================================= */}
          <div className="lg:col-span-8 relative">
            <div
              style={{
                transform: shouldReduceMotion
                  ? "none"
                  : `perspective(1000px) rotateX(${mousePos.normY * -1}deg) rotateY(${mousePos.normX * 1}deg)`,
                transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
              }}
              className="relative rounded-3xl bg-[#102238] border border-[#D6A85F]/30 overflow-hidden shadow-[0_25px_70px_rgba(7,17,31,0.9)] group"
            >
              {/* SIGNATURE 750MS "PROPERTY SCAN" LASER LINE ANIMATION */}
              {isScanning && (
                <motion.div
                  initial={{ top: 0 }}
                  animate={{ top: "100%" }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="absolute left-0 right-0 h-[2px] bg-[#E8C985] shadow-[0_0_15px_#D6A85F,0_0_25px_#D6A85F] z-40 pointer-events-none"
                />
              )}

              {/* Main Cinematic Hero Image: scale 1.15 -> 1 */}
              <div className="relative w-full aspect-[16/11] sm:aspect-[16/10] bg-[#0C1929] overflow-hidden">
                <motion.img
                  key={`hero-img-${activeProp.id}`}
                  src={activeProp.image}
                  alt={activeProp.title}
                  initial={{ scale: 1.15, filter: "blur(6px)" }}
                  animate={
                    inView
                      ? { scale: 1, filter: "blur(0px)" }
                      : { scale: 1.15, filter: "blur(6px)" }
                  }
                  transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05]"
                />

                {/* Cinematic Dark Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-[#07111F]/30 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07111F]/40 via-transparent to-[#07111F]/40 pointer-events-none" />

                {/* Top Badge: FEATURED • PROPERTY ID */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#07111F]/88 backdrop-blur-md border border-[#D6A85F]/30 shadow-lg text-[10px] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D6A85F] animate-ping" />
                  <span className="font-semibold tracking-wider text-[#D6A85F]">FEATURED</span>
                  <span className="text-[#6F9BB8] border-l border-[#D6A85F]/20 pl-1.5">
                    {activeProp.propertyId}
                  </span>
                </div>

                {/* Bottom Left Hero Label: translateX(-60px -> 0) */}
                <motion.div
                  initial={{ opacity: 0, x: -60 }}
                  animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-20"
                >
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#07111F]/90 backdrop-blur-xl border border-[#D6A85F]/25 shadow-xl">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#6F9BB8] mb-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D6A85F]" />
                      <span>{activeProp.city}</span>
                    </div>

                    <h3 className="font-editorial text-2xl sm:text-3xl text-[#F5F3ED] font-medium tracking-tight">
                      {activeProp.title}
                    </h3>

                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#D6A85F]/15">
                      <span className="text-xl sm:text-2xl font-bold font-mono text-[#D6A85F]">
                        {activeProp.price}
                      </span>
                      <span className="text-xs font-mono text-[#9BA9B8]">
                        {activeProp.specs}
                      </span>
                    </div>
                  </div>
                </motion.div>

              </div>

              {/* ===================================================== */}
              {/* 4. OVERLAPPING PROPERTY INTELLIGENCE PANEL (BOTTOM)   */}
              {/* translateX(80px -> 0)                                 */}
              {/* ===================================================== */}
              <motion.div
                initial={{ opacity: 0, x: 80 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 80 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="p-4 sm:p-6 bg-[#0C1929] border-t border-[#D6A85F]/20"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Left Metrics (Cols 1-8) */}
                  <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#D6A85F]/15">
                    {/* Valuation */}
                    <div className="pt-1 sm:pt-0 sm:pr-3">
                      <span className="text-[9.5px] uppercase font-mono tracking-wider text-[#6F9BB8] block">
                        CURRENT VALUATION
                      </span>
                      <span className="text-lg sm:text-xl font-bold font-mono text-[#F5F3ED] block mt-0.5">
                        {activeProp.price}
                      </span>
                      <span className="text-[9.5px] text-[#6FA58A] font-mono">Title Insured</span>
                    </div>

                    {/* Appreciation */}
                    <div className="pt-2 sm:pt-0 sm:px-3">
                      <span className="text-[9.5px] uppercase font-mono tracking-wider text-[#6F9BB8] block">
                        EST. APPRECIATION
                      </span>
                      <span className="text-lg sm:text-xl font-bold font-mono text-[#6FA58A] block mt-0.5">
                        {activeProp.appreciation}
                      </span>
                      <span className="text-[9.5px] text-[#9BA9B8] font-mono">12M Annualized</span>
                    </div>

                    {/* Investment Score */}
                    <div className="pt-2 sm:pt-0 sm:px-3">
                      <span className="text-[9.5px] uppercase font-mono tracking-wider text-[#6F9BB8] block">
                        INVESTMENT SCORE
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg sm:text-xl font-bold font-mono text-[#D6A85F]">
                          {activeProp.score}
                        </span>
                        <span className="text-[10px] font-mono text-[#9BA9B8]">/ 100</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#102238] rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-[#D6A85F]"
                          style={{ width: `${activeProp.score}%` }}
                        />
                      </div>
                    </div>

                    {/* Availability Status */}
                    <div className="pt-2 sm:pt-0 sm:pl-3">
                      <span className="text-[9.5px] uppercase font-mono tracking-wider text-[#6F9BB8] block">
                        PLATFORM STATUS
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold mt-1 text-[#6FA58A]">
                        <span className="w-2 h-2 rounded-full bg-[#6FA58A] animate-pulse" />
                        {activeProp.status}
                      </span>
                      <span className="text-[9.5px] text-[#6F9BB8] font-mono block">Direct Escrow</span>
                    </div>
                  </div>

                  {/* 5. MINI PROPERTY MAP & REGIONAL TELEMETRY (COLS 9-12) */}
                  <div className="md:col-span-4 rounded-xl bg-[#102238] border border-[#D6A85F]/20 p-3 shadow-inner">
                    <div className="flex items-center justify-between text-[9.5px] font-mono text-[#6F9BB8] mb-1">
                      <span className="flex items-center gap-1 text-[#D6A85F]">
                        <Compass className="w-3 h-3" /> {activeProp.cityMarker} REGION
                      </span>
                      <span>{activeProp.coordinates}</span>
                    </div>

                    {/* Mini Vector Map Canvas with Animated Route: scale 1.1 -> 1 */}
                    <motion.div
                      initial={{ scale: 1.1 }}
                      animate={inView ? { scale: 1 } : { scale: 1.1 }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      className="relative h-14 w-full bg-[#07111F] rounded-lg overflow-hidden border border-[#D6A85F]/15 flex items-center justify-center"
                    >
                      <svg viewBox="0 0 200 60" className="w-full h-full opacity-60">
                        <path d="M 10 30 Q 60 10 100 35 T 190 25" stroke="#6F9BB8" strokeWidth="0.8" strokeDasharray="3 3" fill="none" />
                        {/* Transit line to city center */}
                        <motion.line
                          x1="30"
                          y1="40"
                          x2="160"
                          y2="20"
                          stroke="#D6A85F"
                          strokeWidth="1.2"
                          strokeDasharray="4 4"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <circle cx="30" cy="40" r="3" fill="#6FA58A" />
                        <circle cx="160" cy="20" r="4" fill="#D6A85F" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-between px-3 text-[9px] font-mono">
                        <span className="text-[#9BA9B8]">Nearby: {activeProp.nearbyCount} Properties</span>
                        <span className="text-[#D6A85F]">Avg: {activeProp.avgNearbyValue}</span>
                      </div>
                    </motion.div>
                  </div>

                </div>
              </motion.div>

            </div>
          </div>

          {/* ======================================================= */}
          {/* 7. SIDE PROPERTY STACK (3 PARTIALLY OVERLAPPING CARDS)  */}
          {/* Clicking transitions preview into the hero slot        */}
          {/* ======================================================= */}
          <div className="lg:col-span-3 flex flex-col space-y-4">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#6F9BB8] font-semibold">
                PORTFOLIO QUEUE
              </span>
              <span className="text-[10px] font-mono text-[#D6A85F]">
                CLICK TO INSPECT
              </span>
            </div>

            {stackedProperties.map((prop, idx) => (
              <motion.div
                key={prop.id}
                onClick={() => {
                  const targetIdx = INTELLIGENCE_PROPERTIES.findIndex((p) => p.id === prop.id);
                  if (targetIdx !== -1) handleSelectProperty(targetIdx);
                }}
                initial={{ opacity: 0, y: 35, scale: 0.94, clipPath: "inset(12% 0% 0% 0%)" }}
                animate={
                  inView
                    ? { opacity: 1, y: 0, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }
                    : { opacity: 0, y: 35, scale: 0.94, clipPath: "inset(12% 0% 0% 0%)" }
                }
                transition={{ duration: 0.65, delay: 0.12 * idx, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-2xl bg-[#102238] border border-[#D6A85F]/20 p-3 shadow-lg hover:border-[#D6A85F]/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Micro Thumbnail */}
                <div className="relative h-28 w-full rounded-xl overflow-hidden bg-[#0C1929] mb-2.5">
                  <img
                    src={prop.image}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#07111F]/80 text-[8.5px] font-mono text-[#D6A85F] border border-[#D6A85F]/20">
                    {prop.categoryName}
                  </div>
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-[#07111F]/80 text-[8.5px] font-mono text-[#6FA58A] border border-[#6FA58A]/30">
                    {prop.status}
                  </div>
                </div>

                <div>
                  <h4 className="font-editorial text-sm font-semibold text-[#F5F3ED] truncate group-hover:text-[#D6A85F] transition-colors">
                    {prop.title}
                  </h4>
                  <div className="text-[10px] font-mono text-[#6F9BB8] mt-0.5 truncate">
                    {prop.city}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#D6A85F]/15">
                    <span className="text-sm font-bold font-mono text-[#D6A85F]">
                      {prop.price}
                    </span>
                    <span className="text-[9.5px] font-mono text-[#6FA58A] bg-[#142A42] px-1.5 py-0.5 rounded border border-[#6FA58A]/30">
                      {prop.appreciation} ROI
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

        {/* ========================================================= */}
        {/* NEXT STEPS IN YOUR ACQUISITION JOURNEY CTA CARD          */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl bg-gradient-to-r from-[#102238] via-[#142A42] to-[#102238] border border-[#D6A85F]/25 p-8 sm:p-12 lg:p-14 shadow-[0_25px_60px_rgba(7,17,31,0.9)] overflow-hidden text-center"
        >
          {/* Subtle architectural wave line drawing & telemetry nodes */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg viewBox="0 0 1000 300" className="w-full h-full">
              <path d="M 0 150 Q 250 80 500 150 T 1000 150" stroke="#D6A85F" strokeWidth="1.5" fill="none" />
              <line x1="0" y1="150" x2="1000" y2="150" stroke="#6F9BB8" strokeWidth="0.8" strokeDasharray="6 6" />
              {/* Telemetry nodes stack on right */}
              <circle cx="760" cy="80" r="3" fill="#D6A85F" />
              <circle cx="760" cy="100" r="5" stroke="#6FA58A" strokeWidth="1" fill="none" />
              <circle cx="760" cy="120" r="1.5" fill="#6F9BB8" />
              <circle cx="760" cy="140" r="1.5" fill="#D6A85F" />
            </svg>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-[10px] uppercase font-mono tracking-[0.28em] text-[#D6A85F] font-semibold block mb-3">
              NEXT STEPS IN YOUR ACQUISITION JOURNEY
            </span>

            <h3 className="font-editorial text-3xl sm:text-4xl md:text-5xl text-[#F5F3ED] font-normal tracking-tight">
              Find The Property That <br />
              <span className="italic text-[#D6A85F]">Fits Your Future.</span>
            </h3>

            <p className="mt-4 text-sm sm:text-base text-[#9BA9B8] leading-relaxed max-w-xl mx-auto">
              Discover, manage and evaluate properties through one intelligent real-estate platform.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => navigate("/properties")}
                className="px-8 py-3.5 sm:py-4 rounded-xl bg-[#D6A85F] text-[#07111F] font-bold text-xs sm:text-sm tracking-wider uppercase hover:bg-[#E8C985] transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>EXPLORE PROPERTIES</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenEnquiry && onOpenEnquiry("Portfolio Investment Consultation")}
                className="px-8 py-3.5 sm:py-4 rounded-xl bg-[#102238] border border-[#D6A85F]/40 text-[#F5F3ED] font-semibold text-xs sm:text-sm tracking-wider uppercase hover:border-[#D6A85F] hover:text-[#D6A85F] transition-all cursor-pointer"
              >
                <span>CONSULT PORTFOLIO ADVISOR</span>
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Sparkles, ArrowRight } from "lucide-react";

const POPULAR_HERO_LOCATIONS = [
  { name: "Bardhaman", state: "West Bengal", count: "5+ listings" },
  { name: "Worli, Mumbai", state: "Maharashtra", count: "Skyline Penthouses" },
  { name: "Alibaug Coast", state: "Maharashtra", count: "Waterfront Villas" },
  { name: "Jubilee Hills", state: "Hyderabad", count: "Luxury Estates" },
  { name: "Whitefield", state: "Bangalore", count: "Private Manors" },
  { name: "Golf Course Road", state: "Gurugram", count: "High-Rise Residences" },
];

export default function EditorialHero({ onOpenEnquiry }) {
  const [searchLocation, setSearchLocation] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // Bidirectional scroll progress
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const heroContentY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.15]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault();
    setSearchFocused(false);
    if (searchLocation.trim()) {
      navigate(`/properties?query=${encodeURIComponent(searchLocation.trim())}`);
    } else {
      navigate("/properties");
    }
  };

  const handleSelectLocation = (locName) => {
    setSearchLocation(locName);
    setSearchFocused(false);
    navigate(`/properties?query=${encodeURIComponent(locName)}`);
  };

  const filteredLocations = searchLocation.trim()
    ? POPULAR_HERO_LOCATIONS.filter((l) =>
        l.name.toLowerCase().includes(searchLocation.toLowerCase().trim())
      )
    : POPULAR_HERO_LOCATIONS;

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative w-full min-h-[calc(100vh-68px)] lg:h-[calc(100vh-68px)] flex items-center overflow-hidden bg-slate-900"
    >
      {/* Full-screen banner with bidirectional scroll scale */}
      <motion.div
        style={{
          scale: shouldReduceMotion ? 1 : heroScale,
        }}
        className="absolute inset-0 w-full h-full overflow-hidden origin-center"
      >
        <img
          src="/hero-building-4k.jpg"
          alt="Prime Luxury City Architecture"
          className="w-full h-full object-cover object-center select-none pointer-events-none"
        />
        {/* Dark cinematic overlay so centered white type stays legible */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/35 to-transparent pointer-events-none" />
      </motion.div>

      {/* 2. CENTERED CONTENT WITH BIDIRECTIONAL SCROLL TRANSFORMS */}
      <motion.div
        style={{
          y: shouldReduceMotion ? 0 : heroContentY,
          opacity: shouldReduceMotion ? 1 : heroOpacity,
        }}
        className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center justify-center text-center px-4 sm:px-6 py-16 sm:py-20"
      >

          {/* Top logo mark */}
          <div className="flex items-center gap-1.5 text-white/90 mb-5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/50 text-[10px] font-bold">
              ◇
            </span>
            <span className="text-xs font-bold tracking-[0.22em] uppercase">PrimeNest</span>
          </div>

          {/* Headline */}
          <h1
            id="hero-headline"
            className="font-editorial text-[32px] sm:text-5xl lg:text-[56px] font-medium text-white uppercase leading-[1.08] tracking-wide drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]"
          >
            Discover Visionary Estates
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-[12px] sm:text-[13.5px] text-white/75 font-normal max-w-xl leading-relaxed font-sans">
            Discover an exclusive portfolio of architecture-refined residences
            <br className="hidden sm:block" />
            along a curated coastline of luxury mansions.
          </p>

          {/* Centered pill search */}
          <div ref={searchRef} className="relative mt-6 w-full max-w-xl">
            <form
              onSubmit={handleSearch}
              className="w-full bg-white rounded-full p-1.5 pl-5 shadow-[0_16px_40px_rgba(0,0,0,0.30)] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchLocation}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(e) => {
                    setSearchLocation(e.target.value);
                    setSearchFocused(true);
                  }}
                  placeholder="Search by location (e.g. Bardhaman, Worli)…"
                  className="w-full bg-transparent border-0 outline-none text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 font-medium"
                />
              </div>

              <button
                type="submit"
                id="hero-search-btn"
                className="bg-[#176B5B] hover:bg-[#115044] text-white text-xs sm:text-[13px] font-semibold px-7 py-2.5 rounded-full transition-all duration-200 active:scale-95 shadow-md shrink-0 cursor-pointer"
              >
                <span>Search</span>
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-slate-200 bg-white shadow-2xl p-3 space-y-2 text-left">
                <div className="flex items-center gap-1.5 px-2 pb-1 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  <Sparkles className="w-3 h-3 text-[#0B63C5]" />
                  <span>Popular Locations & Landmarks</span>
                </div>

                <div className="space-y-1">
                  {filteredLocations.map((loc) => (
                    <button
                      key={loc.name}
                      type="button"
                      onClick={() => handleSelectLocation(loc.name)}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-left transition group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0B63C5] flex items-center justify-center shrink-0">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#0B63C5] transition truncate">
                            {loc.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{loc.state}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                        {loc.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-2 text-[11px] text-slate-400">
                  <span>Browse all properties</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchFocused(false);
                      navigate("/properties");
                    }}
                    className="text-[#0B63C5] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Glass stats bar */}
          <div className="mt-8 w-full max-w-xl rounded-2xl bg-white/85 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.25)] px-2 sm:px-4 py-3.5 grid grid-cols-3 divide-x divide-slate-900/15">
            <div className="px-2 sm:px-4 text-center">
              <p className="font-editorial text-lg sm:text-2xl font-semibold text-[#0B3D33] leading-none">
                90k+
              </p>
              <p className="mt-1 text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-600 font-sans">
                People Trust PrimeNest
              </p>
            </div>
            <div className="px-2 sm:px-4 text-center">
              <p className="font-editorial text-lg sm:text-2xl font-semibold text-[#0B3D33] leading-none">
                2.4k+
              </p>
              <p className="mt-1 text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-600 font-sans">
                Average 5-Star Reviews
              </p>
            </div>
            <div className="px-2 sm:px-4 text-center">
              <p className="font-editorial text-lg sm:text-2xl font-semibold text-[#0B3D33] leading-none">
                500+
              </p>
              <p className="mt-1 text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-600 font-sans">
                Verified Luxury Estates
              </p>
            </div>
          </div>
        </motion.div>
    </section>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MapPin, Ruler, PhoneCall, ShieldCheck, Sparkles, Globe, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BentoGrid, BentoGridItem } from "../components/ui/bento-grid";
import axios from "axios";

export const PROJECTS = [
  {
    id: 1,
    name: "Greenfields Estate",
    location: "New Town, Kolkata",
    price: "₹45L - ₹1.2Cr",
    type: "Residential",
    status: "Available",
    area: "850 - 2,400 sq.ft.",
    badge: "RERA Certified",
    tagline: "Eco-Luxury Living with Smart Automation",
    img: "/projects/greenfields.png",
  },
  {
    id: 2,
    name: "Skyline Commercial Hub",
    location: "Salt Lake Sector V, Kolkata",
    price: "₹80L - ₹3.5Cr",
    type: "Commercial",
    status: "Available",
    area: "600 - 5,000 sq.ft.",
    badge: "Hot Selling",
    tagline: "Grade-A Corporate Spaces & Retail Slots",
    img: "/projects/skyline.png",
  },
  {
    id: 3,
    name: "Sunrise Plot Township",
    location: "Rajarhat, Kolkata",
    price: "₹18L - ₹55L",
    type: "Plotted",
    status: "Limited Units",
    area: "1,200 - 4,800 sq.ft.",
    badge: "New Launch",
    tagline: "Gated Community Plots in Booming Corridors",
    img: "/projects/sunrise.png",
  },
  {
    id: 4,
    name: "Metro Heights",
    location: "EM Bypass, Kolkata",
    price: "₹60L - ₹1.8Cr",
    type: "Residential",
    status: "Available",
    area: "1,050 - 3,200 sq.ft.",
    badge: "Premium Luxury",
    tagline: "High-Rise Sky Villas with Panoramic Views",
    img: "/projects/metro.png",
  },
   {
    id: 5,
    name: "Sunflower Plot Township",
    location: "Topsia, Kolkata",
    price: "₹18L - ₹55L",
    type: "Residential",
    status: "Limited Units",
    area: "1,200 - 4,800 sq.ft.",
    badge: "New Launch",
    tagline: "Gated Community Plots in Booming Corridors",
    img: "/projects/sunflower.png",
  },
  
];

const ROOMS = {
  living: {
    name: "Living Room",
    img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000&q=80",
    hotspots: [
      { top: "55%", left: "32%", target: "bedroom", label: "Walk to Bedroom" },
      { top: "50%", left: "75%", target: "balcony", label: "Step to Balcony" },
    ]
  },
  bedroom: {
    name: "Master Bedroom",
    img: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1000&q=80",
    hotspots: [
      { top: "62%", left: "20%", target: "living", label: "Return to Living Room" },
    ]
  },
  balcony: {
    name: "Panoramic Balcony",
    img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1000&q=80",
    hotspots: [
      { top: "68%", left: "80%", target: "living", label: "Return to Living Room" },
    ]
  }
};

export default function FeaturedProjects({ onEnquireClick, compareIds = [], onToggleCompare, projects: propProjects, loading = false }) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [wishlist, setWishlist] = useState([]);
  const [activeTourProject, setActiveTourProject] = useState(null);
  const [currentRoom, setCurrentRoom] = useState("living");

  const projects = propProjects && propProjects.length > 0 ? propProjects : PROJECTS;

  const toggleWishlist = (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filteredProjects = projects.filter((proj) => {
    if (activeFilter === "All") return true;
    const typeLower = (proj.type || "").toLowerCase();
    if (activeFilter === "Residential") {
      return typeLower === "residential" || typeLower === "apartment" || typeLower === "villa" || typeLower === "flat" || typeLower === "house";
    }
    if (activeFilter === "Commercial") {
      return typeLower === "commercial" || typeLower === "office" || typeLower === "shop" || typeLower === "penthouse";
    }
    if (activeFilter === "Plots") {
      return typeLower === "plotted" || typeLower === "land";
    }
    return true;
  });

  /* 
    Matches the box structure from image_716481.png 
    Renders a dedicated, rounded, frame container at the top of the card
  */
  const ProjectHeaderSkeleton = ({ p }) => (
    <div className="w-full h-48 bg-slate-100 rounded-2xl relative overflow-hidden flex-shrink-0 border border-slate-200/60">
      <img
        src={p.img}
        alt={p.name}
        className="w-full h-full object-cover transform group-hover/bento:scale-105 transition-transform duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent" />
      
      {/* Category Property Type Tag */}
      <span className="absolute bottom-3 left-3 text-[9px] font-black text-white bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded tracking-wider uppercase z-10">
        {p.type}
      </span>

      {/* Wishlist Heart Button */}
      <button
        onClick={(e) => toggleWishlist(p.id, e)}
        className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-xl text-slate-500 hover:text-red-500 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer z-20"
      >
        <Heart className={`h-3.5 w-3.5 transition-colors ${wishlist.includes(p.id) ? "fill-red-500 text-red-500" : ""}`} />
      </button>

      {/* 360° Virtual Tour Activation Trigger */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setActiveTourProject(p);
          setCurrentRoom("living");
        }}
        className="absolute bottom-3 right-3 px-2.5 py-1 bg-white/95 hover:bg-slate-900 hover:text-white text-slate-800 shadow-sm rounded-lg text-[9px] font-black tracking-wide uppercase transition-all duration-300 flex items-center gap-1 cursor-pointer z-20"
      >
        <Globe className="h-3 w-3 text-orange-500" />
        <span>360° Tour</span>
      </button>
    </div>
  );

  return (
    <section className="bg-slate-50/60 py-20 border-b border-slate-200/60 relative overflow-hidden">
      {/* Structural Decorative Canvas Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Premium Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 pb-6 border-b border-slate-200/60">
          <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 border border-orange-100 text-xs font-bold tracking-wide text-orange-600 uppercase mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Handpicked Investments
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
              Hot Selling Developments
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-2 max-w-xl">
              Explore strict RERA-compliant residential estates, commercial hubs, and verified plots mapped out with real site visit options.
            </p>
          </div>

          {/* Clean Segmented Tab Filters */}
          <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm self-start lg:self-auto">
            {["All", "Residential", "Commercial", "Plots"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  activeFilter === filter
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Aceternity UI Bento Grid Container */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[27rem]">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`bg-white rounded-3xl border border-slate-200 overflow-hidden animate-pulse ${i === 3 || i === 6 ? "md:col-span-2" : ""}`}>
                <div className="h-48 bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-8 bg-slate-200 rounded-xl w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
        <BentoGrid className="md:auto-rows-[27rem]">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((p, i) => (
              <BentoGridItem
                key={p.id}
                className={i === 3 || i === 6 ? "md:col-span-2" : ""}
                header={<ProjectHeaderSkeleton p={p} />}
                icon={
                  <div className="flex items-center justify-between gap-2 w-full">
                    <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                      <ShieldCheck className="h-3 w-3" />
                      {p.badge}
                    </div>
                    <div className="flex items-center gap-2">
                      {p.createdAt && (
                        <span className="text-[9px] font-black text-orange-500 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded uppercase">
                          {(() => {
                            const diff = Date.now() - new Date(p.createdAt).getTime();
                            const days = Math.floor(diff / 86400000);
                            if (days === 0) return "Today";
                            if (days === 1) return "Yesterday";
                            if (days < 7) return `${days}d ago`;
                            if (days < 30) return `${Math.floor(days / 7)}w ago`;
                            return `${Math.floor(days / 30)}mo ago`;
                          })()}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <span className={`h-1.5 w-1.5 rounded-full ${p.status === "Limited Units" ? "bg-red-500 animate-pulse" : "bg-emerald-500"}`} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{p.status}</span>
                      </div>
                    </div>
                  </div>
                }
                title={
                  <div className="flex items-center justify-between gap-4 w-full mt-1">
                    <span className="truncate text-slate-800 font-black">{p.name}</span>
                    <span className="text-base font-black text-slate-900 bg-slate-50 px-2.5 py-0.5 rounded-lg border border-slate-200/60 whitespace-nowrap">{p.price}</span>
                  </div>
                }
                description={
                  <div className="flex flex-col justify-between h-full space-y-3 mt-1">
                    <div>
                      <p className="text-xs text-slate-400 italic line-clamp-1 mb-2">{p.tagline}</p>
                      <div className="flex items-center gap-1 text-slate-500">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-xs font-semibold tracking-tight truncate">{p.location || [p.streetAddress, p.city].filter(Boolean).join(", ")}</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                          <Ruler className="h-3.5 w-3.5 text-slate-400" />
                          <span>{p.area.split(" ")[0]} sq.ft</span>
                        </div>
                        <label className="flex items-center gap-1.5 font-bold cursor-pointer select-none" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={compareIds.includes(p.id)}
                            onChange={() => onToggleCompare(p.id)}
                            className="rounded border-slate-300 text-orange-500 focus:ring-orange-500 h-3.5 w-3.5 cursor-pointer accent-orange-500"
                          />
                          <span>Compare</span>
                        </label>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          navigate(`/property/${p.id}`);
                        }}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        <span>Enquire</span>
                      </button>
                    </div>
                  </div>
                }
              />
            ))}
          </AnimatePresence>
        </BentoGrid>
        )}

      </div>

      {/* 360° Virtual Tour Overlay Modal */}
      {activeTourProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={() => setActiveTourProject(null)} />

          <div className="relative bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 z-10 flex flex-col md:flex-row h-[500px]">
            <div className="w-full md:w-60 bg-slate-50 p-6 flex flex-col justify-between border-r border-white/5 flex-shrink-0">
              <div>
                <div className="inline-flex items-center gap-1 text-[9px] font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded uppercase tracking-wider mb-2.5">
                  360° Virtual Tour
                </div>
                <h3 className="text-base font-black text-black tracking-tight">{activeTourProject.name}</h3>
                <p className="text-[10px] text-slate-900 font-semibold mt-1">Click pulsing circles inside the layout to switch views manually.</p>

                <div className="space-y-2.5 mt-8">
                  {Object.keys(ROOMS).map((key) => (
                    <button
                      key={key}
                      onClick={() => setCurrentRoom(key)}
                      className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl text-left border flex items-center justify-between cursor-pointer transition-all duration-300 ${
                        currentRoom === key ? "bg-orange-500 text-white border-orange-500 shadow-lg" : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span>{ROOMS[key].name}</span>
                      {currentRoom === key && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={() => setActiveTourProject(null)} className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black transition-colors text-center">
                Exit Tour
              </button>
            </div>

            <div className="flex-1 relative overflow-hidden bg-slate-950">
              <img src={ROOMS[currentRoom].img} alt="Room Panorama view" className="w-full h-full object-cover blur-[0.5px] scale-105 animate-subtle-zoom" />

              {ROOMS[currentRoom].hotspots.map((hs, i) => (
                <div key={i} style={{ top: hs.top, left: hs.left }} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/hs z-20 cursor-pointer" onClick={() => setCurrentRoom(hs.target)}>
                  <div className="opacity-0 group-hover/hs:opacity-100 transition-opacity duration-300 absolute bottom-8 bg-slate-900/90 text-white text-[9px] font-black px-2 py-0.5 rounded border border-white/10 whitespace-nowrap">
                    {hs.label}
                  </div>
                  <div className="relative flex items-center justify-center">
                    <span className="absolute inline-flex h-8 w-8 rounded-full bg-orange-400 opacity-60 animate-ping" />
                    <span className="relative rounded-full p-2 bg-orange-500 text-white shadow-xl">
                      <Globe className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              ))}

              <button onClick={() => setActiveTourProject(null)} className="absolute top-4 right-4 p-2 rounded-xl bg-slate-950/80 border border-white/10 text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>

              <div className="absolute bottom-4 left-4 bg-slate-950/80 border border-white/10 text-white px-3 py-1.5 rounded-xl font-black text-[10px] uppercase">
                Active View: {ROOMS[currentRoom].name}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
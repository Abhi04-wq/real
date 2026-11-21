"use client";
import React, { useState, useEffect } from "react";
import { Star, ShieldCheck, PhoneCall, Award, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BACKEND_URL } from "../config";

const AGENTS = [
  {
    name: "Rohan Sharma",
    role: "Gurgaon Regional Director",
    rating: "4.9",
    experience: "12 Yrs Exp",
    specialty: "High-Rise Sky Villas & Luxury Commercials",
    propertiesSold: "340+ Properties Sold",
    rera: "HARERA/2023/89",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80",
  },
  {
    name: "Ananya Sen",
    role: "Kolkata Senior Advisor",
    rating: "4.8",
    experience: "8 Yrs Exp",
    specialty: "New Town Residential & Salt Lake Commercials",
    propertiesSold: "180+ Properties Sold",
    rera: "WBRERA/2022/104",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
  },
  {
    name: "Vikram Malhotra",
    role: "Mumbai Prime Director",
    rating: "4.9",
    experience: "15 Yrs Exp",
    specialty: "Bandra Sea-Link Penthouses & Corporate Escrows",
    propertiesSold: "420+ Properties Sold",
    rera: "MahaRERA/2021/304",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&q=80",
  },
  {
    name: "Priya Nair",
    role: "Bangalore Lead Consultant",
    rating: "4.8",
    experience: "9 Yrs Exp",
    specialty: "Gated Plot Townships & Smart Automation Homes",
    propertiesSold: "210+ Properties Sold",
    rera: "PRM/KA/RERA/12",
    img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80",
  },
];

export default function AgentDirectory({ onConnect }) {
  const [agents, setAgents] = useState(AGENTS);
  const [active, setActive] = useState(0);
  const [rotations, setRotations] = useState([]);

  // Generate stable non-shifted random angles once on mount for performance checks
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/agents`);
        const data = await response.json();
        if (data.success && data.agents?.length > 0) {
          const mapped = data.agents.map((a) => ({
            name: a.name,
            role: a.serviceAreas?.length > 0 ? `${a.serviceAreas[0]} Regional Advisor` : "Consulting Partner",
            rating: "4.9",
            experience: `${a.experience || 5} Yrs Exp`,
            specialty: a.specialization || "Residential & Commercial Developments",
            propertiesSold: "150+ Closures",
            rera: a.reraId || "PENDING-RERA",
            img: a.image ? (a.image.startsWith("http") ? a.image : `${BACKEND_URL}${a.image.startsWith("/") ? "" : "/"}${a.image}`) : "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80",
          }));
          setAgents(mapped);
          setRotations(mapped.map(() => Math.floor(Math.random() * 10) - 5));
        } else {
          setRotations(AGENTS.map(() => Math.floor(Math.random() * 10) - 5));
        }
      } catch (err) {
        console.error("Failed to load dynamic advisors:", err);
        setRotations(AGENTS.map(() => Math.floor(Math.random() * 10) - 5));
      }
    };
    fetchAgents();
  }, []);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % agents.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + agents.length) % agents.length);
  };

  const currentAgent = agents[active] || agents[0];

  return (
    <section className="bg-white py-24 border-b border-slate-200/60 relative overflow-hidden">
      {/* Light Mesh Grid Background Layer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none z-0" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header Layout */}
        <div className="max-w-2xl mb-16">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 border border-orange-100 text-xs font-bold tracking-wide text-orange-600 uppercase mb-3">
            <ShieldCheck className="h-4 w-4" />
            Verified Expert Advisory
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
            Top Consulting Partners & Advisors
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed">
            Connect directly with verified RERA-licensed advisors. Get unbiased guidance, structural valuation data, and exclusive portal priority benefits.
          </p>
        </div>

        {/* ACETERNITY UI: Animated Testimonial Dynamic Layout Split Frame */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Stacked Layered Photo Cards */}
          <div className="relative h-80 sm:h-[26rem] w-full flex items-center justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] h-full">
              <AnimatePresence>
                {agents.map((agent, index) => {
                  const isActive = index === active;
                  const isVisible = Math.abs(index - active) <= 1 || (active === agents.length - 1 && index === 0) || (active === 0 && index === agents.length - 1);
                  
                  if (!isVisible) return null;

                  return (
                    <motion.div
                      key={agent.name}
                      initial={{
                        opacity: 0,
                        scale: 0.9,
                        z: -100,
                        rotate: rotations[index] || 0,
                      }}
                      animate={{
                        opacity: isActive ? 1 : 0.35,
                        scale: isActive ? 1 : 0.93,
                        z: isActive ? 0 : -50,
                        rotate: isActive ? 0 : rotations[index] || 0,
                        zIndex: isActive ? 30 : agents.length - index,
                        y: isActive ? 0 : -15,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        z: -100,
                        x: rotations[index] > 0 ? 80 : -80,
                        rotate: rotations[index] || 0,
                      }}
                      transition={{
                        duration: 0.45,
                        ease: [0.23, 1, 0.32, 1],
                      }}
                      className="absolute inset-0 origin-bottom rounded-[2.5rem] overflow-hidden bg-slate-100 border border-slate-200 p-3 shadow-md"
                    >
                      <img
                        src={agent.img}
                        alt={agent.name}
                        className="w-full h-full object-cover rounded-[2rem] select-none pointer-events-none"
                        loading="lazy"
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Information Display Box & Interactive Triggers */}
          <div className="flex flex-col justify-between h-full py-2">
            <div className="space-y-5">
              
              {/* Animated Text Engine content blocks */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none">
                    {currentAgent.name}
                  </h3>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">
                    {currentAgent.role}
                  </p>

                  {/* Rating parameters badge row */}
                  <div className="flex flex-wrap gap-2 items-center mt-3">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-100 text-[11px] font-black text-amber-700">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      <span>{currentAgent.rating} Standard</span>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-[11px] font-black text-slate-600 border border-slate-200">
                      <span>{currentAgent.experience}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-[11px] font-black text-emerald-700 uppercase tracking-wide">
                      <span>{currentAgent.propertiesSold.split(' ')[0]} Closures</span>
                    </div>
                  </div>

                  {/* Specialty and description row */}
                  <div className="mt-6 pt-5 border-t border-slate-100 space-y-4">
                    <p className="text-slate-600 font-medium text-base leading-relaxed">
                      "{currentAgent.specialty}."
                    </p>
                    <p className="text-xs font-semibold text-slate-400">
                      Primary Consultant mapping out client portfolios with transparent compliance, escrow validation, and structural verification criteria.
                    </p>
                  </div>

                  {/* License Tag */}
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-lg uppercase mt-6 tracking-wider">
                    <Award className="h-4 w-4 text-orange-500" />
                    <span>RERA Registration ID: {currentAgent.rera}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation and Contact buttons deck wrapper */}
            <div className="flex items-center justify-between gap-6 mt-10 pt-6 border-t border-slate-100">
              
              {/* Navigation Arrows controllers layout */}
              <div className="flex gap-2">
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-200/80 active:scale-95 transition-all cursor-pointer"
                >
                  ←
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-200/80 active:scale-95 transition-all cursor-pointer"
                >
                  →
                </button>
              </div>

              {/* Instant Call / Chat Action Links */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onConnect(`Consulting with ${currentAgent.name}`)}
                  className="py-2.5 px-6 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black rounded-xl cursor-pointer flex items-center gap-1.5 transition-all active:scale-95 shadow-md shadow-orange-500/10"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Chat with Partner</span>
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
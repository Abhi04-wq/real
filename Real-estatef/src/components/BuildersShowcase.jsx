"use client";
import React, { useState, useMemo } from "react";
import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { BuilderCard } from "../components/ui/builder-card.jsx";

const BUILDERS = [
  { name: "DLF Group", projects: "42 Active Projects", established: "1946", rating: "4.9", logoSrc: "/logos/dlf.png" },
  { name: "Godrej Properties", projects: "38 Active Projects", established: "1990", rating: "4.8", logoSrc: "/logos/godrej.png" },
  { name: "Lodha Group", projects: "56 Active Projects", established: "1980", rating: "4.7", logoSrc: "/logos/lodha.png" },
  { name: "Sobha Limited", projects: "29 Active Projects", established: "1995", rating: "4.9", logoSrc: "/logos/sobha.png" },
  { name: "Prestige Group", projects: "34 Active Projects", established: "1986", rating: "4.8", logoSrc: "/logos/prestige.png" },
  { name: "Tata Housing", projects: "23 Active Projects", established: "1984", rating: "4.9", logoSrc: "/logos/tata.png" },
  { name: "Shapoorji Pallonji", projects: "31 Active Projects", established: "1865", rating: "4.8", logoSrc: "/logos/shapoorji.png" },
  { name: "Omaxe Group", projects: "27 Active Projects", established: "1987", rating: "4.7", logoSrc: "/logos/omaxe.png" },
  { name: "Brigade Group", projects: "33 Active Projects", established: "1986", rating: "4.8", logoSrc: "/logos/brigade.png" },
  { name: "K Raheja Corp", projects: "41 Active Projects", established: "1956", rating: "4.9", logoSrc: "/logos/lrrheja.png" },
  { name: "Mahindra Lifespaces", projects: "22 Active Projects", established: "1994", rating: "4.8", logoSrc: "/logos/mahindra.png" },
  { name: "Puravankara", projects: "35 Active Projects", established: "1975", rating: "4.7", logoSrc: "/logos/puravankara.png" },
];

export default function BuildersShowcase() {
  const [hoveredRow1, setHoveredRow1] = useState(false);
  const [hoveredRow2, setHoveredRow2] = useState(false);

  // Split builders into two rows to scroll in opposite directions
  const row1Builders = useMemo(() => {
    const firstHalf = BUILDERS.slice(0, 6);
    return [...firstHalf, ...firstHalf];
  }, []);

  const row2Builders = useMemo(() => {
    const secondHalf = BUILDERS.slice(6);
    return [...secondHalf, ...secondHalf];
  }, []);

  return (
    <section className="bg-white py-16 border-y border-slate-100 relative overflow-hidden">
      {/* Light Grid Background Matrix */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f8fafc_1px,transparent_1px),linear-gradient(to_bottom,#f8fafc_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-xs font-bold tracking-wide text-orange-600 uppercase mb-3">
              <ShieldCheck className="h-4 w-4" />
              Verified Developer Registry
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Top Builders & Channel Partners
            </h2>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-md leading-relaxed">
            Partnering with India's leading RERA-licensed developers to guarantee transparent pricing, launch booking prioritizations, and legal compliance.
          </p>
        </div>

        {/* Two-Row Opposing Direction Marquee Tracks - Logo Only */}
        <div className="space-y-10 py-4">
          {/* Row 1: Scrolling Right */}
          <div className="w-full overflow-hidden relative py-2 [mask-image:linear-gradient(to_right,transparent,#000_15%,#000_85%,transparent)]">
            <div
              className="flex gap-16 items-center w-max animate-marquee-right"
              style={{
                animationPlayState: hoveredRow1 ? "paused" : "running"
              }}
              onMouseEnter={() => setHoveredRow1(true)}
              onMouseLeave={() => setHoveredRow1(false)}
            >
              {row1Builders.map((builder, index) => (
                <div key={`row1-${builder.name}-${index}`} className="h-16 w-48 flex items-center justify-center shrink-0">
                  <img
                    src={builder.logoSrc}
                    alt={builder.name}
                    title={builder.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Scrolling Left */}
          <div className="w-full overflow-hidden relative py-2 [mask-image:linear-gradient(to_right,transparent,#000_15%,#000_85%,transparent)]">
            <div
              className="flex gap-16 items-center w-max animate-marquee-left"
              style={{
                animationPlayState: hoveredRow2 ? "paused" : "running"
              }}
              onMouseEnter={() => setHoveredRow2(true)}
              onMouseLeave={() => setHoveredRow2(false)}
            >
              {row2Builders.map((builder, index) => (
                <div key={`row2-${builder.name}-${index}`} className="h-16 w-48 flex items-center justify-center shrink-0">
                  <img
                    src={builder.logoSrc}
                    alt={builder.name}
                    title={builder.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
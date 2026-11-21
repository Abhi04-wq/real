"use client";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Landmark, Briefcase, Home, HardHat, ArrowRight } from "lucide-react";
import { BentoGrid, BentoGridItem } from "../components/ui/bento-grid";

const PROPERTY_TYPES = [
  {
    icon: <Landmark className="h-4 w-4 text-orange-500" />,
    label: "Residential Plots",
    count: "1,240 verified units",
    desc: "Premium layout plots ready for immediate registry and construction in booming development zones.",
    img: "/properties/plots.png",
    className: "md:col-span-2", // Spans across 2 columns for architectural bento grid asymmetry
    query: "?type=Plot"
  },
  {
    icon: <Briefcase className="h-4 w-4 text-orange-500" />,
    label: "Commercial Spaces",
    count: "870 premium units",
    desc: "A-grade offices, modular retail shop slots, and business complexes with high rental yields.",
    img: "/properties/commercial.png",
    className: "md:col-span-1",
    query: "?type=Commercial"
  },
  {
    icon: <Home className="h-4 w-4 text-orange-500" />,
    label: "Residential Homes",
    count: "3,560 active units",
    desc: "Stunning high-rise apartments, spacious family duplexes, and independent luxury villas.",
    img: "/properties/residential.png",
    className: "md:col-span-1",
    query: "?type=Residential"
  },
  {
    icon: <HardHat className="h-4 w-4 text-orange-500" />,
    label: "Under Construction",
    count: "420 hot units",
    desc: "Upcoming developer releases with flexible milestone-based payment plans and full secure RERA cover.",
    img: "/properties/construction.png",
    className: "md:col-span-2", // Spans across 2 columns to balance out the bottom row
    query: "?status=Upcoming"
  },
];

// Custom Header renderer to handle light mode graphic layers inside the Bento cells
const BentoCardHeader = ({ img, count }) => (
  <div className="flex flex-1 w-full h-full min-h-[10rem] absolute inset-0 z-0 overflow-hidden rounded-t-3xl">
    {/* Real Estate Asset Cover Image */}
    <img
      src={img}
      alt="Property Classification Cover"
      className="w-full h-full object-cover transform group-hover/bento:scale-105 transition-transform duration-500"
      loading="lazy"
    />
    {/* Soft Dark Base Overlay for text legibility, blending into a light black overlay on hover */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent z-10" />
    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/bento:opacity-100 transition-opacity duration-300 z-10" />
    
    {/* Absolute positioned tag on top corner */}
    <div className="absolute top-4 right-4 z-20">
      <span className="inline-block text-[9px] font-black tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100 uppercase">
        {count}
      </span>
    </div>
  </div>
);

export default function PropertyTypes() {
  const navigate = useNavigate();

  return (
    <section className="bg-slate-50/30 py-20 border-b border-slate-200/60 relative overflow-hidden">
      {/* Light Mesh Grid Background Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Core Layout Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-orange-500 uppercase px-2.5 py-1 rounded-md bg-orange-50 border border-orange-100">
            Browse By Classification 
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight mt-4">
            Explore Verified Inventory
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed">
            Search our licensed portal inventory for residential plots, modular retail offices, ready villas, or builder launches.
          </p>
        </div>

        {/* Aceternity Bento Grid Container */}
        <BentoGrid>
          {PROPERTY_TYPES.map((type, i) => (
            <BentoGridItem
              key={type.label}
              title={type.label}
              description={
                <div className="flex flex-col justify-between h-full">
                  <p className="line-clamp-2">{type.desc}</p>
                  
                  {/* Interactive Active State Action Link indicator */}
                  <div className="flex items-center gap-1 text-xs font-bold text-orange-600 mt-4 opacity-0 group-hover/bento:opacity-100 transform translate-y-2 group-hover/bento:translate-y-0 transition-all duration-300">
                    <span>Explore Listings</span>
                    <ArrowRight className="h-3.5 w-3.5 transform group-hover/bento:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              }
              header={<BentoCardHeader img={type.img} count={type.count} />}
              icon={type.icon}
              className={type.className}
              onClick={() => navigate(`/properties${type.query}`)}
            />
          ))}
        </BentoGrid>

      </div>
    </section>
  );
}
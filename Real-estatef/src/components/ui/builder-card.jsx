import React from "react";
import { Star, Award } from "lucide-react";

// Individual asset rendering with clean layout state boundaries
export const BuilderCard = React.memo(({ builder, index, hovered, setHovered }) => {
  const isBlurred = hovered !== null && hovered !== index;

  return (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={`bg-slate-50 p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between items-center text-center cursor-pointer relative overflow-hidden w-52 flex-shrink-0 ${
        isBlurred 
          ? "blur-[2.5px] scale-[0.97] opacity-40 border-slate-200/60" 
          : "scale-100 opacity-100 border-slate-200 shadow-md shadow-slate-100 hover:border-orange-500/30 hover:shadow-xl hover:shadow-slate-200/65 hover:bg-white"
      }`}
    >
      {/* Top glowing focus indicator rule line */}
      <div 
        className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-orange-500 to-amber-500 transition-opacity duration-300 ${
          hovered === index ? "opacity-100" : "opacity-0"
        }`} 
      />

      <div className="flex flex-col items-center w-full">
        {/* White-glossy container to house the builder logo with high contrast */}
        <div className="w-full h-14 bg-white p-2 rounded-xl flex items-center justify-center mb-4 relative shadow-sm border border-slate-200/50 transition-colors duration-300">
          <img
            src={builder.logoSrc}
            alt={`${builder.name} Corporate Logo`}
            className={`max-w-full max-h-full object-contain transition-all duration-300 ${
              hovered === index ? "grayscale-0 scale-105" : "grayscale opacity-80"
            }`}
            loading="lazy"
          />
        </div>

        {/* Builder Name text configurations */}
        <h3 className={`text-xs font-black tracking-tight leading-snug truncate w-full transition-colors duration-200 ${
          hovered === index ? "text-orange-500" : "text-slate-800"
        }`}>
          {builder.name}
        </h3>

        {/* Licensing Compliance Grid Badge */}
        <div className="inline-flex items-center gap-1 mt-2 text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">
          <Award className="h-3 w-3" />
          RERA Reg
        </div>
      </div>

      {/* Ratings Data Row Metric Block Footer */}
      <div className="flex items-center gap-2 mt-5 pt-3.5 border-t border-slate-100 w-full justify-center text-xs">
        <div className="flex items-center gap-0.5 text-amber-600 font-bold">
          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
          <span>{builder.rating}</span>
        </div>
        <span className="text-slate-300 font-light">|</span>
        <span className="text-[10px] text-slate-500 font-semibold tracking-wide whitespace-nowrap">
          {builder.projects.split(' ')[0]} Projs
        </span>
      </div>
    </div>
  );
});

BuilderCard.displayName = "BuilderCard";
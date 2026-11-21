import React, { useState, useRef } from "react";
import AnimatedCounter from "./AnimatedCounter";
import LuxurySparkline from "./LuxurySparkline";

export default function ThreeDTransparentCard({
  titleTop = "PORTFOLIO",
  titleBottom = "VALUATION",
  value = "₹184.6 Cr",
  trend = "+14.8%",
  trendSub = "vs last mo",
  bottomBarText = "Avg Yield: 11.4% • Verified",
  icon: Icon,
  iconSymbol,
  sparklineData,
  sparklineColor = "#D6A85F",
  isPositive = true,
}) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePos({ x: -200, y: -200 });
      }}
      className="relative rounded-[22px] p-[1.5px] bg-gradient-to-b from-[#1D324D] via-[#142A42]/80 to-[#07111F] shadow-[0_12px_28px_rgba(7,17,31,0.8)] hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(7,17,31,0.95),0_0_24px_rgba(214,168,95,0.14)] transition-all duration-300 cursor-default select-none group overflow-hidden"
    >
      {/* Dynamic Cursor-Following Gold Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[22px] transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(220px circle at ${mousePos.x}px ${mousePos.y}px, rgba(214, 168, 95, 0.16), transparent 75%)`,
        }}
      />

      {/* Inner Elevated Real Estate Bevel Rim */}
      <div className="relative z-10 rounded-[20.5px] p-[1px] bg-gradient-to-b from-[#142A42] via-[#102238] to-[#07111F]">
        {/* Card Faceplate - Primary Card Surface #102238 */}
        <div className="relative rounded-[19.5px] bg-gradient-to-b from-[#102238] via-[#0E1E31] to-[#07111F] p-4 flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_2px_rgba(214,168,95,0.12),inset_0_-2px_4px_rgba(7,17,31,0.6)]">
          {/* Subtle Champagne Gold Specular Reflection Sheen */}
          <div className="pointer-events-none absolute -top-24 -left-20 w-56 h-56 bg-gradient-to-br from-[#D6A85F]/10 via-[#1D324D]/20 to-transparent rotate-45 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-700" />

          {/* Top Section: Stamped Label & Sunken Chamber with Icon */}
          <div className="flex items-start justify-between gap-2 relative z-10">
            <div>
              <span className="block text-[10.5px] font-mono font-bold uppercase tracking-wider text-[#9BA9B8] leading-tight">
                {titleTop}
              </span>
              <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#F5F3ED] leading-tight">
                {titleBottom}
              </span>
            </div>

            {/* Sunken Navy Chamber for Icon */}
            <div className="relative w-10 h-10 rounded-[12px] p-[1px] bg-gradient-to-b from-[#1D324D] to-[#07111F] shadow-inner shrink-0">
              <div className="w-full h-full rounded-[11px] bg-gradient-to-br from-[#142A42] to-[#102238] flex items-center justify-center text-[#D6A85F] relative overflow-hidden shadow-[inset_0_1px_3px_rgba(7,17,31,0.6)]">
                {Icon ? (
                  <Icon className="w-4.5 h-4.5 stroke-[2] drop-shadow-[0_0_6px_rgba(214,168,95,0.35)]" />
                ) : iconSymbol ? (
                  <span className="text-base font-bold font-mono text-[#D6A85F]">{iconSymbol}</span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Main Extruded Value with Animated Counter (Primary Text #F5F3ED) */}
          <div className="mt-2.5 relative z-10">
            <p
              className="text-[20px] sm:text-[22px] xl:text-[21px] 2xl:text-[23px] font-bold font-mono tracking-tight text-[#F5F3ED] leading-tight truncate drop-shadow-[0_2px_4px_rgba(7,17,31,0.7)]"
              title={typeof value === "string" ? value : undefined}
            >
              <AnimatedCounter value={value} />
            </p>
          </div>

          {/* Mini Sparkline Chart */}
          {sparklineData && sparklineData.length > 1 && (
            <div className="relative z-10 mt-1 mb-1">
              <LuxurySparkline
                data={sparklineData}
                color={sparklineColor}
                height={26}
              />
            </div>
          )}

          {/* Trend Pill */}
          <div className="mt-2 inline-flex items-center gap-1.5 self-start px-2 py-0.5 rounded-md bg-[#142A42]/80 border border-[#1D324D] text-[10.5px] font-semibold relative z-10">
            <span
              className={`flex items-center gap-0.5 font-bold ${
                isPositive ? "text-[#6FA58A]" : "text-[#E4777D]"
              }`}
            >
              <span>{isPositive ? "▲" : "▼"}</span>
              <span>{trend}</span>
            </span>
            <span className="text-[#9BA9B8]/80 text-[10px]">{trendSub}</span>
          </div>

          {/* Bottom Inset Translucent Bar */}
          <div className="mt-3 -mx-4 -mb-4 pt-2 pb-2 px-3 rounded-b-[19px] bg-[#0C1929]/90 border-t border-[#1D324D] flex items-center justify-center relative z-10">
            <span className="text-[10.5px] font-medium text-[#9BA9B8] tracking-wide truncate">
              {bottomBarText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

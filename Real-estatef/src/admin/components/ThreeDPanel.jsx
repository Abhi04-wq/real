import React from "react";
import { motion } from "framer-motion";

export default function ThreeDPanel({
  children,
  className = "",
  innerClassName = "",
  contentClassName = "h-full flex flex-col justify-between w-full",
  delay = 0,
  noPadding = false,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className={`relative rounded-[22px] p-[1.5px] bg-gradient-to-b from-[#1D324D]/70 via-[#142A42]/80 to-[#07111F] shadow-[0_16px_36px_rgba(7,17,31,0.8),0_4px_12px_rgba(7,17,31,0.5)] hover:shadow-[0_20px_45px_rgba(7,17,31,0.95),0_0_24px_rgba(214,168,95,0.12)] transition-all duration-300 group ${className}`}
    >
      {/* Inner Elevated Navy Bevel Rim */}
      <div className="relative h-full rounded-[20.5px] p-[1px] bg-gradient-to-b from-[#142A42] via-[#102238] to-[#07111F] shadow-inner">
        {/* Faceplate - Primary Card Surface #102238 */}
        <div
          className={`relative h-full rounded-[19.5px] bg-gradient-to-b from-[#102238] via-[#0E1E31] to-[#07111F] backdrop-blur-2xl ${
            noPadding ? "" : "p-5 sm:p-6"
          } shadow-[inset_0_1px_2px_rgba(214,168,95,0.12),inset_0_-2px_4px_rgba(7,17,31,0.6)] overflow-hidden text-[#F5F3ED] ${innerClassName}`}
        >
          {/* Subtle Champagne Gold Specular Sheen Across Top-Left */}
          <div className="pointer-events-none absolute -top-32 -left-20 w-80 h-80 bg-gradient-to-br from-[#D6A85F]/10 via-[#1D324D]/20 to-transparent rotate-45 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-700" />

          <div className={`relative z-10 ${contentClassName}`}>
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

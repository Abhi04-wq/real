import React from "react";

export default function PrimeNestLogo({
  className = "",
  size = "md", // "sm" | "md" | "lg"
  dark = false,
  showSubtitle = true,
}) {
  // Sizing definitions for the emblem
  const imageSizeClasses =
    size === "sm"
      ? "w-8 h-8"
      : size === "lg"
      ? "w-14 h-14"
      : "w-10 h-10 sm:w-11 sm:h-11";

  const titleSizeClasses =
    size === "sm"
      ? "text-sm tracking-[0.08em]"
      : size === "lg"
      ? "text-xl sm:text-2xl tracking-[0.12em]"
      : "text-base sm:text-lg tracking-[0.10em]";

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Prime Nest Logo Emblem Image */}
      <div className="relative shrink-0 overflow-hidden rounded-lg transition-transform duration-300 group-hover:scale-105">
        <img
          src="/primenest-emblem-clean.png"
          alt="Prime Nest Emblem"
          className={`${imageSizeClasses} object-contain`}
        />
      </div>

      {/* "prime nest" text beside the image */}
      <div className="flex flex-col justify-center leading-none">
        <span
          className={`font-sans font-extrabold uppercase ${titleSizeClasses} ${
            dark ? "text-white" : "text-[#0C294A]"
          }`}
          style={{ letterSpacing: "0.12em" }}
        >
          Prime Nest
        </span>
        {showSubtitle && (
          <span
            className={`font-sans font-semibold text-[8px] sm:text-[9px] uppercase tracking-[0.28em] mt-0.5 ${
              dark ? "text-amber-400" : "text-[#B87314]"
            }`}
          >
            Properties
          </span>
        )}
      </div>
    </div>
  );
}

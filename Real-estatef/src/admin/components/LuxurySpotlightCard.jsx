import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

export default function LuxurySpotlightCard({
  children,
  className = "",
  innerClassName = "",
  spotlightColor = "rgba(185, 150, 91, 0.08)", // Champagne Gold #B9965B
  borderColor = "#DFDED7",
  hoverBorderColor = "#B9965B",
  bgColor = "bg-white",
  tilt = false,
  onClick,
}) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  const [isHovered, setIsHovered] = useState(false);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (tilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3;
      const rotateY = ((x - centerX) / centerX) * 3;
      setRotate({ x: rotateX, y: rotateY });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePos({ x: -200, y: -200 });
    if (tilt) setRotate({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: tilt && isHovered
          ? `perspective(800px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateY(-3px)`
          : undefined,
        transition: isHovered ? "transform 0.12s ease-out" : "transform 0.4s ease-out",
      }}
      className={`relative overflow-hidden rounded-2xl ${bgColor} transition-all duration-300 ${
        isHovered
          ? "shadow-[0_12px_28px_rgba(23,35,47,0.08),0_0_20px_rgba(185,150,91,0.12)] -translate-y-[3px]"
          : "shadow-[0_2px_12px_rgba(23,35,47,0.03)]"
      } ${className}`}
    >
      {/* Outer border container with animated highlight */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-colors duration-300"
        style={{
          border: `1px solid ${isHovered ? hoverBorderColor : borderColor}`,
        }}
      />

      {/* Dynamic Cursor-Following Gold Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, ${spotlightColor}, transparent 75%)`,
        }}
      />

      {/* Subtle top edge champagne gold highlight line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#B9965B]/35 to-transparent" />

      {/* Content wrapper */}
      <div className={`relative z-10 ${innerClassName}`}>{children}</div>
    </motion.div>
  );
}

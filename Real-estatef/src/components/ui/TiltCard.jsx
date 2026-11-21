import React, { useRef, useState, useCallback } from "react";

export default function TiltCard({
  children,
  className = "",
  maxTilt = 10,
  perspective = 1000,
  scale = 1.02,
  speed = 400,
  glare = true,
  onClick,
  ...props
}) {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
    boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)",
    transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99), box-shadow ${speed}ms ease`,
  });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = useCallback(
    (e) => {
      if (!cardRef.current) return;
      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      // Dynamic 3D lighting shadow that moves realistically with card tilt
      const shadowX = (rotateY * -1.8).toFixed(1);
      const shadowY = (Math.abs(rotateX) * 1.5 + 20).toFixed(1);

      setStyle({
        transform: `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`,
        boxShadow: `${shadowX}px ${shadowY}px 45px -5px rgba(15, 23, 42, 0.18), 0 10px 20px -5px rgba(15, 23, 42, 0.08)`,
        transition: "transform 80ms ease-out, box-shadow 80ms ease-out",
      });

      if (glare) {
        setGlarePosition({
          x: (x / rect.width) * 100,
          y: (y / rect.height) * 100,
          opacity: 0.16,
        });
      }
    },
    [maxTilt, perspective, scale, glare]
  );

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      boxShadow: "0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)",
      transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99), box-shadow ${speed}ms ease`,
    });
    if (glare) {
      setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [perspective, speed, glare]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        ...style,
        transformStyle: "preserve-3d",
        willChange: "transform, box-shadow",
      }}
      className={`relative select-none ${className}`}
      {...props}
    >
      {children}

      {/* Subtle Dynamic Glare Sheen Reflection Effect */}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300 z-30 overflow-hidden"
          style={{
            opacity: glarePosition.opacity,
            background: `radial-gradient(circle 350px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.4) 0%, transparent 80%)`,
          }}
        />
      )}
    </div>
  );
}

import React, { useEffect, useRef } from "react";

export default function LuxuryAmbientParticles({ count = 38 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle colors for Light Architectural Theme: Champagne Gold (#B9965B), Light Gold (#D8BF8A), Sage (#71877B), Deep Navy (#17232F)
    const particleColors = [
      { r: 185, g: 150, b: 91 },  // Champagne Gold #B9965B
      { r: 216, g: 191, b: 138 }, // Light Gold #D8BF8A
      { r: 113, g: 135, b: 123 }, // Architectural Sage #71877B
      { r: 101, g: 113, b: 123 }, // Muted Slate #65717B
    ];

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25 - 0.1, // gentle upward drift
      opacity: Math.random() * 0.18 + 0.05,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulseFactor: Math.random() * Math.PI,
    }));

    let lastTime = performance.now();

    const render = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulseFactor += p.pulseSpeed;

        // Wrap around boundaries
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulseFactor));

        // Draw soft glowing particle
        ctx.beginPath();
        const radGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        radGrad.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentOpacity})`);
        radGrad.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);
        ctx.fillStyle = radGrad;
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${currentOpacity * 1.2})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-70"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

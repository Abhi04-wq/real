import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Professional Real Estate Cursor
 * 
 * Design:
 * 1. "akta line r moto": A sleek, elegant tapering trailing line that follows the cursor path smoothly.
 * 2. "sekan theke choto choto dot porbe": From along the trailing line, delicate tiny micro-dots 
 *    shed and fall gently downwards under gravity.
 * 3. "professional colour": Curated luxury real-estate palette — Deep Emerald Slate, 
 *    Refined Champagne Gold, and Luminous Pearl Ivory.
 * 4. High-performance canvas (60-144 FPS) with high-DPI retina scaling and pointer-events: none.
 */
export default function ProfessionalCursor() {
  const location = useLocation();

  const isDashboardSoftware = [
    "/panel",
    "/manage",
    "/agent",
    "/dashboard",
    "/super-admin",
    "/admin",
    "/manager",
  ].some((path) => location.pathname.startsWith(path));

  const canvasRef = useRef(null);
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);

  const mouse = useRef({ x: -500, y: -500 });
  const prevMouse = useRef({ x: -500, y: -500 });
  const ringPos = useRef({ x: -500, y: -500 });
  const isVisible = useRef(false);
  const isHovered = useRef(false);
  const isClicking = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || isDashboardSoftware) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Curated Luxury Professional Colors: Deep Emerald, Warm Champagne Gold, Pearl Ivory
    const professionalColors = [
      { r: 23,  g: 107, b: 91  }, // Deep Emerald Teal (#176B5B)
      { r: 200, g: 168, b: 107 }, // Champagne Gold (#C8A86B)
      { r: 212, g: 175, b: 55  }, // Polished Brass Gold (#D4AF37)
      { r: 30,  g: 130, b: 110 }, // Soft Sage Emerald
      { r: 245, g: 242, b: 235 }, // Pearl Ivory
    ];

    // Trailing line history points
    const trailPoints = [];
    const MAX_TRAIL_POINTS = 22;

    // Small falling micro-dots
    const microDots = [];
    const MAX_MICRO_DOTS = 180;

    /**
     * Spawn a tiny micro-dot dropping down from the trailing line ("choto choto dot porbe")
     */
    const spawnMicroDot = (originX, originY, speedX = 0) => {
      if (microDots.length >= MAX_MICRO_DOTS) return;
      const col = professionalColors[Math.floor(Math.random() * professionalColors.length)];
      microDots.push({
        x: originX + (Math.random() - 0.5) * 4,
        y: originY + (Math.random() - 0.5) * 2,
        vx: speedX * 0.15 + (Math.random() - 0.5) * 0.5,
        vy: 0.6 + Math.random() * 0.9,          // falls downward
        gravity: 0.05 + Math.random() * 0.04,   // gentle continuous gravity
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.03 + Math.random() * 0.04,
        size: 0.8 + Math.random() * 0.9,        // crisp micro dot: 0.8px - 1.7px
        color: col,
        life: 1.0,
        decay: 0.012 + Math.random() * 0.012,   // smooth graceful fade
      });
    };

    /**
     * Subtle click ripple micro-dots
     */
    const spawnClickRipple = (cx, cy) => {
      const count = 16;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const col = professionalColors[Math.floor(Math.random() * professionalColors.length)];
        const spd = 1.2 + Math.random() * 1.8;
        microDots.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd + 0.3,
          gravity: 0.07,
          wobble: 0,
          wobbleSpeed: 0,
          size: 1.0 + Math.random() * 0.8,
          color: col,
          life: 1.0,
          decay: 0.018,
        });
      }
    };

    const handleMouseMove = (e) => {
      const mx = e.clientX;
      const my = e.clientY;

      if (!isVisible.current) {
        isVisible.current = true;
        prevMouse.current.x = mx;
        prevMouse.current.y = my;
        ringPos.current.x = mx;
        ringPos.current.y = my;
        if (cursorDotRef.current) cursorDotRef.current.style.opacity = "1";
        if (cursorRingRef.current) cursorRingRef.current.style.opacity = "1";
      }

      const dx = mx - prevMouse.current.x;
      const dy = my - prevMouse.current.y;
      const dist = Math.hypot(dx, dy);

      // Check hover state on clickable items
      const target = e.target;
      if (target) {
        const isClickable = !!target.closest(
          "button, a, input, textarea, select, [role='button'], .cursor-pointer, [data-cursor='hover']"
        );
        isHovered.current = isClickable;
      }

      // Add point to the trailing line ("akta line r moto")
      trailPoints.unshift({ x: mx, y: my, age: 1.0, dist });
      if (trailPoints.length > MAX_TRAIL_POINTS) {
        trailPoints.pop();
      }

      // Spawn small micro-dots from along the line ("sekan theke choto choto dot porbe")
      if (dist > 2) {
        const dotCount = Math.min(Math.floor(dist / 8) + 1, 3);
        for (let i = 0; i < dotCount; i++) {
          const t = Math.random();
          const dropX = prevMouse.current.x + dx * t;
          const dropY = prevMouse.current.y + dy * t;
          spawnMicroDot(dropX, dropY, dx * 0.1);
        }
      }

      prevMouse.current.x = mx;
      prevMouse.current.y = my;
      mouse.current.x = mx;
      mouse.current.y = my;
    };

    const handleMouseDown = (e) => {
      isClicking.current = true;
      spawnClickRipple(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      isClicking.current = false;
    };

    const handleMouseLeave = () => {
      isVisible.current = false;
      trailPoints.length = 0;
      if (cursorDotRef.current) cursorDotRef.current.style.opacity = "0";
      if (cursorRingRef.current) cursorRingRef.current.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      isVisible.current = true;
      if (cursorDotRef.current) cursorDotRef.current.style.opacity = "1";
      if (cursorRingRef.current) cursorRingRef.current.style.opacity = "1";
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    let stationaryTimer = 0;

    const render = () => {
      animId = requestAnimationFrame(render);

      const mx = mouse.current.x;
      const my = mouse.current.y;

      // When cursor is stationary, occasionally drop a tiny dot softly
      if (isVisible.current && mx > -100 && my > -100) {
        stationaryTimer++;
        if (stationaryTimer % 6 === 0) {
          spawnMicroDot(mx, my, 0);
        }
      }

      // Smooth lerp follower ring
      const ease = 0.22;
      ringPos.current.x += (mx - ringPos.current.x) * ease;
      ringPos.current.y += (my - ringPos.current.y) * ease;

      const rx = ringPos.current.x;
      const ry = ringPos.current.y;

      // Update Minimalist Cursor Elements
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      }

      if (cursorRingRef.current) {
        const scale = isClicking.current ? 0.75 : isHovered.current ? 1.5 : 1.0;
        cursorRingRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
        if (isHovered.current) {
          cursorRingRef.current.style.borderColor = "rgba(200, 168, 107, 0.85)";
          cursorRingRef.current.style.boxShadow = "0 0 10px rgba(200, 168, 107, 0.35)";
        } else {
          cursorRingRef.current.style.borderColor = "rgba(23, 107, 91, 0.4)";
          cursorRingRef.current.style.boxShadow = "0 0 6px rgba(23, 107, 91, 0.15)";
        }
      }

      // Clear Canvas
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Scaled Drawing Context
      ctx.save();
      ctx.scale(dpr, dpr);

      // --- 1. RENDER SLEEK TRAILING LINE ("akta line r moto") ---
      // Age and trim trailing points
      for (let i = trailPoints.length - 1; i >= 0; i--) {
        trailPoints[i].age -= 0.055;
        if (trailPoints[i].age <= 0) {
          trailPoints.splice(i, 1);
        }
      }

      if (trailPoints.length > 2) {
        // Draw tapering line segments with elegant Champagne Gold to Emerald gradient
        for (let i = 0; i < trailPoints.length - 1; i++) {
          const p1 = trailPoints[i];
          const p2 = trailPoints[i + 1];

          // Normalized position: 1 at cursor head, 0 at tail
          const progress = 1 - i / trailPoints.length;
          const alpha = progress * p1.age * 0.75;
          const lineWidth = Math.max(0.6, progress * 2.2);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);

          // Interpolate color from Champagne Gold at head to Deep Emerald at tail
          const r = Math.round(200 * progress + 23 * (1 - progress));
          const g = Math.round(168 * progress + 107 * (1 - progress));
          const b = Math.round(107 * progress + 91 * (1 - progress));

          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.stroke();
        }
      }

      // --- 2. RENDER SMALL FALLING MICRO-DOTS ("sekan theke choto choto dot porbe") ---
      for (let i = microDots.length - 1; i >= 0; i--) {
        const dot = microDots[i];
        dot.life -= dot.decay;

        if (dot.life <= 0) {
          microDots.splice(i, 1);
          continue;
        }

        // Physics: falling under gravity with subtle drift
        dot.wobble += dot.wobbleSpeed;
        dot.vy += dot.gravity;
        dot.x += dot.vx + Math.sin(dot.wobble) * 0.25;
        dot.y += dot.vy;

        const currentSize = Math.max(0.5, dot.size * (0.4 + 0.6 * dot.life));
        const alpha = Math.max(0, Math.min(1, dot.life * 0.85));

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dot.color.r}, ${dot.color.g}, ${dot.color.b}, ${alpha})`;
        ctx.shadowColor = `rgba(${dot.color.r}, ${dot.color.g}, ${dot.color.b}, ${alpha * 0.6})`;
        ctx.shadowBlur = currentSize * 2;
        ctx.fill();
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isDashboardSoftware]);

  if (isDashboardSoftware) return null;

  return (
    <>
      {/* 1. Full-Screen Canvas with Ultra-High z-index */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[99998] select-none"
        style={{ pointerEvents: "none" }}
      />

      {/* 2. Sleek Minimalist Architectural Center Dot */}
      <div
        ref={cursorDotRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[99999] opacity-0 transition-opacity duration-200 select-none"
        style={{ pointerEvents: "none", willChange: "transform" }}
      >
        <div className="relative flex items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-[#176B5B] shadow-[0_0_6px_rgba(23,107,91,0.7)]" />
        </div>
      </div>

      {/* 3. Refined Follower Ring */}
      <div
        ref={cursorRingRef}
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[99999] opacity-0 transition-all duration-150 ease-out select-none"
        style={{ pointerEvents: "none", willChange: "transform, width, height, border-color" }}
      >
        <div className="relative h-6 w-6 rounded-full border border-[#176B5B]/40 transition-transform duration-200 flex items-center justify-center">
          <span className="absolute -top-0.5 h-1 w-1 rounded-full bg-[#C8A86B]" />
        </div>
      </div>
    </>
  );
}

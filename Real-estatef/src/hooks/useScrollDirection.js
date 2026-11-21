import { useState, useEffect } from "react";

/**
 * Tracks the scroll direction ('down' | 'up') efficiently using requestAnimationFrame.
 * Ignores tiny scroll jitter (< 5px threshold).
 */
export function useScrollDirection(threshold = 5) {
  const [scrollDirection, setScrollDirection] = useState("down");
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    let prevY = window.pageYOffset || document.documentElement.scrollTop;

    const updateScrollDir = () => {
      const currentY = window.pageYOffset || document.documentElement.scrollTop;

      if (Math.abs(currentY - prevY) >= threshold) {
        setScrollDirection(currentY > prevY ? "down" : "up");
        prevY = currentY > 0 ? currentY : 0;
        setLastScrollY(prevY);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return {
    scrollDirection,
    isScrollingDown: scrollDirection === "down",
    isScrollingUp: scrollDirection === "up",
    lastScrollY,
  };
}

export default useScrollDirection;

import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { gsap } from "gsap";

export interface SparkleNavbarProps {
  /**
   * Array of strings representing the navigation menu items.
   */
  items: string[];
  /**
   * The accent glow color for the active indicator beam.
   */
  color?: string;
  /**
   * The currently active item name.
   */
  activeItem?: string;
  /**
   * Callback fired when an item button is clicked.
   */
  onItemClick?: (item: string, index: number) => void;
}

/**
 * High-performance, luxury Sparkle Navbar with a glitch-free sliding indicator,
 * dynamic width matching, and glowing light beam transition.
 */
const SparkleNavbar: React.FC<SparkleNavbarProps> = ({
  items,
  color = "#E05A2B",
  activeItem,
  onItemClick,
}) => {
  const getIndexFromItem = (item?: string) => {
    if (!item) return 0;
    const idx = items.findIndex((it) => it.toLowerCase() === item.toLowerCase());
    return idx >= 0 ? idx : 0;
  };

  const [activeIndex, setActiveIndex] = useState(() => getIndexFromItem(activeItem));

  const navRef = useRef<HTMLDivElement>(null);
  const activeElementRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Calculate pixel metrics for the active button relative to the nav container
  const getTargetMetrics = (element: HTMLButtonElement) => {
    if (!navRef.current) return { x: 0, width: 32 };
    const elementRect = element.getBoundingClientRect();
    const navRect = navRef.current.getBoundingClientRect();
    const width = Math.max(24, elementRect.width);
    const x = elementRect.left - navRect.left;
    return { x, width };
  };

  // Set initial position synchronously before browser paint to prevent 0,0 jump
  useLayoutEffect(() => {
    const currentIdx = getIndexFromItem(activeItem);
    setActiveIndex(currentIdx);

    const targetBtn = buttonRefs.current[currentIdx];
    if (targetBtn && activeElementRef.current && navRef.current) {
      const { x, width } = getTargetMetrics(targetBtn);
      gsap.set(activeElementRef.current, {
        x,
        width,
        opacity: 1,
      });
    }
  }, []);

  // Smoothly move the indicator to targetIndex
  const moveToTab = (targetIndex: number, isImmediate = false) => {
    const targetBtn = buttonRefs.current[targetIndex];
    const activeEl = activeElementRef.current;
    if (!targetBtn || !activeEl || !navRef.current) return;

    // Kill any existing tween on the indicator to prevent conflicts
    gsap.killTweensOf(activeEl);

    const { x, width } = getTargetMetrics(targetBtn);
    const isMovingRight = targetIndex > activeIndex;

    if (isImmediate) {
      gsap.set(activeEl, { x, width, opacity: 1 });
      setActiveIndex(targetIndex);
      return;
    }

    // Smooth gliding pill tween
    gsap.to(activeEl, {
      x,
      width,
      opacity: 1,
      duration: 0.36,
      ease: "power2.out",
    });

    // Animate beam sweep inside the indicator
    const beam = activeEl.querySelector(".sparkle-beam") as HTMLElement | null;
    const star = activeEl.querySelector(".sparkle-star") as HTMLElement | null;

    if (beam) {
      gsap.killTweensOf(beam);
      gsap.fromTo(
        beam,
        {
          x: isMovingRight ? "-120%" : "120%",
          opacity: 0.95,
        },
        {
          x: isMovingRight ? "120%" : "-120%",
          opacity: 0,
          duration: 0.42,
          ease: "power1.out",
        }
      );
    }

    if (star) {
      gsap.killTweensOf(star);
      gsap.fromTo(
        star,
        {
          scale: 0,
          opacity: 0,
          x: isMovingRight ? 0 : width,
        },
        {
          keyframes: [
            { scale: 1.4, opacity: 1, duration: 0.18 },
            { scale: 0, opacity: 0, x: isMovingRight ? width : 0, duration: 0.22 },
          ],
          ease: "power2.out",
        }
      );
    }

    setActiveIndex(targetIndex);
  };

  // Sync when activeItem prop changes from parent (e.g. route change, scroll spy)
  useEffect(() => {
    if (activeItem) {
      const idx = getIndexFromItem(activeItem);
      if (idx !== activeIndex) {
        moveToTab(idx);
      }
    }
  }, [activeItem]);

  // Window resize observer to ensure indicator always aligns with button
  useEffect(() => {
    const handleResize = () => {
      const targetBtn = buttonRefs.current[activeIndex];
      if (targetBtn && activeElementRef.current) {
        const { x, width } = getTargetMetrics(targetBtn);
        gsap.set(activeElementRef.current, { x, width });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeIndex]);

  const handleItemClick = (index: number) => {
    if (index === activeIndex) {
      onItemClick?.(items[index], index);
      return;
    }

    // Immediately trigger smooth move
    moveToTab(index);

    // Notify parent callback
    onItemClick?.(items[index], index);
  };

  return (
    <>
      <style>{`
        .sparkle-nav-menu {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
        }

        .sparkle-nav-menu ul {
          margin: 0;
          padding: 0;
          list-style: none;
          display: flex;
          align-items: center;
          gap: 34px;
        }

        .sparkle-nav-menu ul li {
          position: relative;
        }

        .sparkle-nav-menu ul li button {
          appearance: none;
          border: none;
          cursor: pointer;
          background: transparent;
          padding: 6px 2px;
          margin: 0;
          font-family: inherit;
          font-size: 13.5px;
          font-weight: 500;
          color: #4B5563;
          letter-spacing: -0.01em;
          transition: color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          z-index: 2;
          user-select: none;
        }

        .sparkle-nav-menu ul li button:hover {
          color: #0C294A;
        }

        .sparkle-nav-menu ul li.active button {
          color: #0C294A;
          font-weight: 600;
        }

        .sparkle-nav-menu .active-indicator {
          position: absolute;
          bottom: -4px;
          left: 0;
          height: 2.5px;
          border-radius: 9999px;
          background: linear-gradient(90deg, ${color} 0%, #FF9060 50%, ${color} 100%);
          box-shadow: 
            0 0 10px 1.5px rgba(224, 90, 43, 0.65),
            0 0 20px 3px rgba(224, 90, 43, 0.30);
          pointer-events: none;
          overflow: visible;
          z-index: 1;
          opacity: 0;
          will-change: transform, width;
        }

        .sparkle-nav-menu .sparkle-beam {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.95) 50%,
            transparent 100%
          );
          filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.9));
          pointer-events: none;
          opacity: 0;
        }

        .sparkle-nav-menu .sparkle-star {
          position: absolute;
          top: -2.5px;
          left: 0;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #FFFFFF;
          box-shadow: 
            0 0 8px 2px #FFFFFF,
            0 0 16px 4px ${color};
          pointer-events: none;
          opacity: 0;
          transform: translate(-50%, 0);
        }
      `}</style>

      <nav className="sparkle-nav-menu" ref={navRef} aria-label="Main Navigation">
        <ul>
          {items.map((item, index) => (
            <li key={item} className={index === activeIndex ? "active" : ""}>
              <button
                ref={(el) => {
                  buttonRefs.current[index] = el;
                }}
                onClick={() => handleItemClick(index)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>

        {/* Sliding Glowing Active Indicator with Shimmer Beam */}
        <div className="active-indicator" ref={activeElementRef}>
          <div className="sparkle-beam" />
          <div className="sparkle-star" />
        </div>
      </nav>
    </>
  );
};

export default SparkleNavbar;

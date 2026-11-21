import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Ensures smooth window scrolling to top on route change,
 * or smooth scrolling to the target hash element (e.g. #about, #projects, #properties) if provided.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");

      const tryScroll = () => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          return true;
        }
        return false;
      };

      // Attempt immediate scroll if element already rendered
      if (!tryScroll()) {
        // Fallback retry for dynamic component mounting
        const timer1 = setTimeout(tryScroll, 120);
        const timer2 = setTimeout(tryScroll, 320);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname, hash]);

  return null;
}

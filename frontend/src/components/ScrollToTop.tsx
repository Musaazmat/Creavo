// ScrollToTop — auto-scrolls to the top on every route change, plus a floating
// "back to top" button that appears once the user scrolls down.
import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";
import { scrollToTopStyles as s } from "../assets/dummyStyles";

// Renders nothing; smoothly scrolls the window to the top whenever the route changes.
export default function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, location.hash]);
  return null;
}

// Floating "back to top" button that appears after scrolling down and scrolls up on click.
export function ScrollToTopButton({ showAfter = 300 }) {
  const [visible, setVisible] = useState(false);

  const checkScroll = useCallback(() => {
    setVisible(window.pageYOffset > showAfter);
  }, [showAfter]);

  useEffect(() => {
    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      window.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className={s.button}
    >
      <ArrowUp className={s.icon} />
    </button>
  );
}
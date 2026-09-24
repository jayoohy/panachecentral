"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Snap can settle a few px off either end (focus-ring padding, sub-pixel widths).
const EDGE_TOLERANCE = 8;

/**
 * Prev/next state for a horizontal scroll-snap row. The browser does the
 * swiping and snapping natively; this only tracks whether either end has been
 * reached and pages the row by one viewport (snap then lands on a card edge).
 * `ready` re-attaches once the row actually renders (after loading).
 */
export function useRailScroll<T extends HTMLElement>(ready: boolean) {
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();
  const [edges, setEdges] = useState({ atStart: true, atEnd: true });

  useEffect(() => {
    const el = ref.current;
    if (!ready || !el) return;
    const update = () =>
      setEdges({
        atStart: el.scrollLeft <= EDGE_TOLERANCE,
        atEnd:
          el.scrollLeft + el.clientWidth >= el.scrollWidth - EDGE_TOLERANCE,
      });
    el.addEventListener("scroll", update, { passive: true });
    // Fires once on observe, which also sets the initial state.
    const resize = new ResizeObserver(update);
    resize.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      resize.disconnect();
    };
  }, [ready]);

  const page = useCallback(
    (direction: 1 | -1) => {
      const el = ref.current;
      if (!el) return;
      el.scrollBy({
        left: direction * el.clientWidth,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [reducedMotion],
  );

  return { ref, ...edges, page };
}

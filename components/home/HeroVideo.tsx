"use client";

import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const VIDEO_SRC = "/video/Woman_breathing_in_dark_room_20260918220952.mp4";

/**
 * Full-bleed looping background video with `children` (headline/CTA) layered on top.
 * Reduced motion: the loop doesn't autoplay, so the browser shows the first frame as a still.
 * The section behind it is already Onyx Black, so a slow or failed load leaves the copy readable.
 */
export function HeroVideo({ children }: { children?: ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative h-[calc(100svh-61px)] min-h-[32rem] overflow-hidden">
      <video
        src={VIDEO_SRC}
        poster="/img/woman-in-jewelry.webp?auto=format&fit=crop&w=1400&q=80"
        autoPlay={!reducedMotion}
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {children}
    </div>
  );
}

import type { ReactNode } from "react";

/**
 * Left-aligned commerce page title (Playfair, sentence case per the Stitch
 * design system) — distinct from the marketing `SectionHeading`. `compact`
 * is for panels like the cart drawer.
 */
export function PageHeading({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  return (
    <h1
      className={`font-serif leading-[1.15] tracking-tight text-bone ${
        compact ? "text-2xl" : "text-3xl sm:text-5xl"
      }`}
    >
      {children}
    </h1>
  );
}

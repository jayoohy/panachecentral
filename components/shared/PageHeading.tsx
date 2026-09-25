import type { ReactNode } from "react";

/**
 * Left-aligned commerce page title (Playfair, sentence case per the Stitch
 * design system) — distinct from the marketing `SectionHeading`. `compact`
 * is for panels like the cart drawer, which sits in every page's DOM — so it
 * renders an h2, leaving the page's own title as its only h1.
 */
export function PageHeading({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  const Tag = compact ? "h2" : "h1";
  return (
    <Tag
      className={`font-serif leading-[1.15] tracking-tight text-bone ${
        compact ? "text-2xl" : "text-3xl sm:text-5xl"
      }`}
    >
      {children}
    </Tag>
  );
}

import type { ReactNode } from "react";

/** Wide-tracked uppercase section label ("01 / The House") — Stitch `section-kicker`. */
export function SectionKicker({
  children,
  tone = "onyx",
  className = "",
}: {
  children: ReactNode;
  tone?: "onyx" | "bone";
  className?: string;
}) {
  return (
    <p
      className={`text-xs font-medium uppercase tracking-[0.22em] ${
        tone === "onyx" ? "text-gold" : "text-onyx/60"
      } ${className}`}
    >
      {children}
    </p>
  );
}

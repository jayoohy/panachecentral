import type { ReactNode } from "react";

type Tone = "onyx" | "surface" | "bone";

const TONE_CLASSES: Record<Tone, string> = {
  onyx: "bg-onyx text-bone",
  surface: "bg-surface text-bone",
  bone: "bg-bone text-onyx",
};

/**
 * Shared section shell for the homepage's Onyx / raised-charcoal / Bone bands.
 * Spacing follows the Stitch design system (space-xl+ between sections, 4rem desktop margin).
 * Contrast for each tone is verified in docs/design/panache-central-website-design-spec.md §9.6.
 */
export function Section({
  id,
  tone,
  children,
  className = "",
  labelledBy,
}: {
  id?: string;
  /** id of the element that names this band, for sections whose heading isn't a direct child. */
  labelledBy?: string;
  tone: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`${TONE_CLASSES[tone]} px-6 py-24 sm:px-10 sm:py-32 lg:px-16 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

/**
 * Inline "Coming Soon" state — design spec §3.11.
 * Used wherever real content is pending (Trust section, unanswered FAQ items)
 * instead of fabricated proof points, numbers, or policy text.
 */
export function ComingSoonInline({
  tone = "onyx",
  className = "",
}: {
  tone?: "onyx" | "bone";
  className?: string;
}) {
  return (
    <p className={`italic ${tone === "onyx" ? "text-bone/60" : "text-onyx/60"} ${className}`}>
      This page is on its way.
    </p>
  );
}

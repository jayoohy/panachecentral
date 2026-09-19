/** Gold stroke, not green — stays on-brand (design spec §5). Shown once when paymentStatus resolves to paid. */
export function SuccessCheck() {
  return (
    <svg
      className="t-success-check"
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="28" cy="28" r="24" stroke="var(--color-gold)" strokeWidth="2" />
      <path d="M18 29l7 7 13-15" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

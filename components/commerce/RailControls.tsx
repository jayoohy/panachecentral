/** Previous/next buttons for a product rail (design spec §7: real buttons, 44px, disabled at the ends). */
export function RailControls({
  label,
  atStart,
  atEnd,
  onPage,
}: {
  label: string;
  atStart: boolean;
  atEnd: boolean;
  onPage: (direction: 1 | -1) => void;
}) {
  const button =
    "t-press flex h-11 w-11 items-center justify-center border border-bone/20 text-bone transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-bone/20 disabled:hover:text-bone";

  return (
    <div className="hidden gap-2 sm:flex">
      <button
        type="button"
        className={button}
        disabled={atStart}
        onClick={() => onPage(-1)}
        aria-label={`Previous: ${label}`}
      >
        <Chevron direction="left" />
      </button>
      <button
        type="button"
        className={button}
        disabled={atEnd}
        onClick={() => onPage(1)}
        aria-label={`Next: ${label}`}
      >
        <Chevron direction="right" />
      </button>
    </div>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

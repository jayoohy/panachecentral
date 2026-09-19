"use client";

/** 44x44pt hit targets despite compact visual size (design spec §6/§7). */
export function QuantityStepper({
  quantity,
  onChange,
  max,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-none border border-bone/20">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(0, quantity - 1))}
        className="t-press flex h-11 w-11 items-center justify-center text-lg text-bone"
      >
        −
      </button>
      <span key={quantity} className="min-w-8 text-center text-sm tabular-nums text-bone" aria-live="polite">
        {quantity}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(max ? Math.min(max, quantity + 1) : quantity + 1)}
        disabled={max !== undefined && quantity >= max}
        className="t-press flex h-11 w-11 items-center justify-center text-lg text-bone disabled:cursor-not-allowed disabled:text-bone/30"
      >
        +
      </button>
    </div>
  );
}

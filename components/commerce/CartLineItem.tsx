"use client";

import { formatMoney } from "@/lib/format-money";
import { QuantityStepper } from "@/components/commerce/QuantityStepper";
import type { CartItem } from "@/lib/duka/types";

// Cart responses don't carry a currency field (only Order does — see
// docs/storefront-api.md §5.4 vs §5.10); formatMoney defaults to the
// documented tenant default ("NGN") for cart display.
export function CartLineItem({
  item,
  onQuantityChange,
  pending,
}: {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  pending?: boolean;
}) {
  const attributeSummary = Object.entries(item.attributeValues ?? {})
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  return (
    <div className={`flex gap-4 py-4 transition-opacity ${pending ? "opacity-50" : ""}`}>
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-none bg-surface">
        {item.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.thumbnail} alt="" className="h-full w-full rounded-none object-cover" />
        ) : (
          <ImagePlaceholderIcon />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <p className="font-serif text-sm text-bone">{item.productName}</p>
          {attributeSummary && <p className="text-xs text-bone/50">{attributeSummary}</p>}
        </div>
        <div className="flex items-center justify-between">
          <QuantityStepper quantity={item.quantity} onChange={onQuantityChange} />
          <p className="text-sm font-medium tabular-nums text-bone">
            {formatMoney(item.lineTotalMinorUnits)}
          </p>
        </div>
      </div>
    </div>
  );
}

function ImagePlaceholderIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-bone/25" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M21 16.5 15.5 11 6 20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

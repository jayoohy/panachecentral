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
  const attributeSummary = Object.entries(item.attributeValues)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  return (
    <div className={`flex gap-4 py-4 transition-opacity ${pending ? "opacity-50" : ""}`}>
      <div className="h-20 w-20 shrink-0 rounded-none bg-surface">
        {item.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.thumbnail} alt="" className="h-full w-full rounded-none object-cover" />
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

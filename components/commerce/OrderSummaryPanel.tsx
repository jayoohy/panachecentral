import { formatMoney } from "@/lib/format-money";
import type { Cart, Order } from "@/lib/duka/types";

/** Read-only recap reused on /checkout (from a Cart) and /order-confirmation (from an Order). */
export function OrderSummaryPanel({ source }: { source: Cart | Order }) {
  const items = "items" in source ? source.items : [];
  const currency = "currency" in source ? source.currency : undefined;

  return (
    <div className="rounded-none border border-bone/10 bg-surface p-6">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-bone/60">Order Summary</p>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.productVariantId} className="flex justify-between text-sm">
            <span className="text-bone/80">
              {item.productName} × {item.quantity}
            </span>
            <span className="tabular-nums text-bone">{formatMoney(item.lineTotalMinorUnits, currency)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 space-y-1.5 border-t border-bone/10 pt-4 text-sm">
        <div className="flex justify-between text-bone/70">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatMoney(source.subtotalMinorUnits, currency)}</span>
        </div>
        {source.discountMinorUnits > 0 && (
          <div className="flex justify-between text-bronze">
            <span>Discount</span>
            <span className="tabular-nums">−{formatMoney(source.discountMinorUnits, currency)}</span>
          </div>
        )}
        <div className="flex justify-between text-bone/70">
          <span>Tax</span>
          <span className="tabular-nums">{formatMoney(source.taxMinorUnits, currency)}</span>
        </div>
        <div className="flex justify-between pt-1.5 font-medium text-bone">
          <span>Total</span>
          <span className="tabular-nums">{formatMoney(source.totalMinorUnits, currency)}</span>
        </div>
      </div>
    </div>
  );
}

import { formatMoney } from "@/lib/format-money";
import type { DeliveryCharge } from "@/lib/checkout";
import type { Cart, Order } from "@/lib/duka/types";

/**
 * Read-only recap reused on /checkout (from a Cart) and /order-confirmation (from an Order).
 * On checkout, `deliveryCharge` previews the fee for the chosen method (PRD R4) — the cart's
 * own total excludes it; an Order's total already includes its recorded fee (§5.9).
 */
export function OrderSummaryPanel({
  source,
  deliveryCharge,
}: {
  source: Cart | Order;
  deliveryCharge?: DeliveryCharge;
}) {
  const items = "items" in source ? source.items : [];
  const currency = "currency" in source ? source.currency : undefined;
  const charge: DeliveryCharge =
    "currency" in source
      ? source.deliveryFeeMinorUnits
        ? { kind: "fee", minorUnits: source.deliveryFeeMinorUnits }
        : source.deliveryNote
          ? { kind: "note", note: source.deliveryNote }
          : null
      : (deliveryCharge ?? null);
  const previewFee = !("currency" in source) && charge?.kind === "fee" ? charge.minorUnits : 0;

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
        {charge?.kind === "fee" && (
          <div className="flex justify-between text-bone/70">
            <span>Delivery</span>
            <span className="tabular-nums">
              {charge.minorUnits === 0 ? "Free" : formatMoney(charge.minorUnits, currency)}
            </span>
          </div>
        )}
        <div className="flex justify-between pt-1.5 font-medium text-bone">
          <span>Total</span>
          <span className="tabular-nums">{formatMoney(source.totalMinorUnits + previewFee, currency)}</span>
        </div>
        {charge?.kind === "note" && (
          <p className="pt-2 text-xs leading-relaxed text-bone/60">Delivery: {charge.note}</p>
        )}
      </div>
    </div>
  );
}

import { formatMoney } from "@/lib/format-money";
import type { Cart } from "@/lib/duka/types";

export function CartSummary({ cart }: { cart: Cart }) {
  return (
    <dl className="space-y-2 text-sm">
      <Row label="Subtotal" value={formatMoney(cart.subtotalMinorUnits)} />
      {cart.discountMinorUnits > 0 && (
        <Row label="Discount" value={`−${formatMoney(cart.discountMinorUnits)}`} tone="gold" />
      )}
      <div className="border-t border-bone/10 pt-2">
        <Row label="Total" value={formatMoney(cart.totalMinorUnits)} bold />
      </div>
    </dl>
  );
}

function Row({
  label,
  value,
  bold,
  tone,
}: {
  label: string;
  value: string;
  bold?: boolean;
  tone?: "gold";
}) {
  return (
    <div className="flex justify-between">
      <dt className={bold ? "font-medium text-bone" : "text-bone/70"}>{label}</dt>
      <dd
        className={`tabular-nums ${bold ? "font-medium text-bone" : tone === "gold" ? "text-bronze" : "text-bone"}`}
      >
        {value}
      </dd>
    </div>
  );
}

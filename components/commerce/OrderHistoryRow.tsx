import Link from "next/link";
import { formatMoney } from "@/lib/format-money";
import { formatOrderReference } from "@/lib/format-order-status";
import { PaymentStatusBadge } from "@/components/commerce/StatusBadges";
import type { OrderSummary } from "@/lib/duka/types";

// No raw id shown — a formatted reference instead (user-relevant-data-presentation rule).
export function OrderHistoryRow({ order }: { order: OrderSummary }) {
  const date = new Date(order.createdAt).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="flex items-center justify-between gap-4 border-b border-bone/10 py-4 transition-colors hover:bg-surface"
    >
      <div>
        <p className="text-sm font-medium text-bone">{formatOrderReference(order.id)}</p>
        <p className="text-xs text-bone/50">{date}</p>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-sm tabular-nums text-bone">{formatMoney(order.totalMinorUnits, order.currency)}</p>
        <PaymentStatusBadge status={order.paymentStatus} />
      </div>
    </Link>
  );
}

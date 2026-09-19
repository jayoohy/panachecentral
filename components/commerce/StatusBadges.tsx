import { formatFulfillmentStatus, formatPaymentStatus } from "@/lib/format-order-status";
import type { FulfillmentStatus, PaymentStatus } from "@/lib/duka/types";

// Icon + text always, never color alone (accessibility rule, design spec §7).
const PAYMENT_ICON: Record<PaymentStatus, string> = {
  pending: "○", // circle outline
  paid: "✓", // check
  failed: "✕", // x
  refunded: "↺", // undo arrow
};

const PAYMENT_TONE: Record<PaymentStatus, string> = {
  pending: "text-bone/70 border-bone/20",
  paid: "text-gold border-gold/60",
  failed: "text-(--color-error) border-(--color-error)/40",
  refunded: "text-bone/70 border-bone/20",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-none border px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] ${PAYMENT_TONE[status]}`}
    >
      <span aria-hidden="true">{PAYMENT_ICON[status]}</span>
      {formatPaymentStatus(status)}
    </span>
  );
}

export function FulfillmentStatusBadge({ status }: { status: FulfillmentStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-none border border-bone/20 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-bone/80">
      {formatFulfillmentStatus(status)}
    </span>
  );
}

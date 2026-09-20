import type { FulfillmentStatus, PaymentStatus } from "@/lib/duka/types";

// Translates the API's internal enums into shopper-facing labels — never
// render a raw enum value in the UI (user-relevant-data-presentation rule).
const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: "Awaiting Payment",
  paid: "Paid",
  failed: "Payment Failed",
  refunded: "Refunded",
};

const FULFILLMENT_LABELS: Record<FulfillmentStatus, string> = {
  received: "Received",
  payment_confirmed: "Confirmed",
  inventory_updated: "Preparing",
  picking: "Preparing",
  packing: "Preparing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  completed: "Completed",
  feedback: "Completed",
};

export function formatPaymentStatus(status: PaymentStatus): string {
  return PAYMENT_LABELS[status] ?? status;
}

export function formatFulfillmentStatus(status: FulfillmentStatus): string {
  return FULFILLMENT_LABELS[status] ?? status;
}

// Display-only reference — the API has no human order number (design spec §8).
export function formatOrderNumber(orderId: string): string {
  return orderId.slice(0, 8).toUpperCase();
}

export function formatOrderReference(orderId: string): string {
  return `Order #${formatOrderNumber(orderId)}`;
}

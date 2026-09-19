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
  payment_confirmed: "Payment Confirmed",
  inventory_updated: "Preparing",
  picking: "Picking",
  packing: "Packing",
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
export function formatOrderReference(orderId: string): string {
  return `Order #${orderId.slice(0, 8).toUpperCase()}`;
}

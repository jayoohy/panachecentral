import { describe, expect, it } from "vitest";
import {
  formatFulfillmentStatus,
  formatOrderReference,
  formatPaymentStatus,
} from "./format-order-status";

describe("formatPaymentStatus", () => {
  it("translates every documented payment status", () => {
    expect(formatPaymentStatus("pending")).toBe("Awaiting Payment");
    expect(formatPaymentStatus("paid")).toBe("Paid");
    expect(formatPaymentStatus("failed")).toBe("Payment Failed");
    expect(formatPaymentStatus("refunded")).toBe("Refunded");
  });
});

describe("formatFulfillmentStatus", () => {
  it("translates every documented fulfillment status", () => {
    expect(formatFulfillmentStatus("received")).toBe("Received");
    expect(formatFulfillmentStatus("payment_confirmed")).toBe("Payment Confirmed");
    expect(formatFulfillmentStatus("dispatched")).toBe("Dispatched");
    expect(formatFulfillmentStatus("completed")).toBe("Completed");
  });
});

describe("formatOrderReference", () => {
  it("derives a short uppercase reference from the order id, never the raw uuid", () => {
    const reference = formatOrderReference("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
    expect(reference).toBe("Order #A1B2C3D4");
  });
});

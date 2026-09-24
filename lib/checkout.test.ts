import { describe, expect, it } from "vitest";
import {
  availableMethods,
  deliveryCharge,
  pickCheckoutRequest,
} from "./checkout";
import { NIGERIAN_STATES } from "./nigerian-states";
import type { StoreInfo } from "./duka/types";

const store = (overrides: Partial<StoreInfo>): StoreInfo => ({
  name: "Panache Central",
  logoUrl: null,
  accentColor: null,
  currency: "NGN",
  pricesIncludeTax: false,
  contact: { phone: null, address: null },
  delivery: { enabled: true, feeMode: "flat", feeMinorUnits: 200000 },
  pickup: { available: true },
  ...overrides,
});

describe("pickCheckoutRequest", () => {
  it("forwards a delivery checkout and drops unknown fields (PRD N1, R2)", () => {
    const request = pickCheckoutRequest({
      cartId: "cart-1",
      customerEmail: " jane@example.com ",
      fulfilmentMethod: "delivery",
      deliveryAddress: {
        recipientName: "Jane Doe",
        phone: "08030000000",
        addressLine: "12 Independence Avenue",
        city: "Enugu",
        state: "Enugu",
        landmark: "  ",
        isAdmin: true,
      },
      pickupLocationId: "loc-1",
      totalMinorUnits: 1,
      savedAddressId: "someone-elses",
    });

    expect(request).toEqual({
      cartId: "cart-1",
      customerEmail: "jane@example.com",
      fulfilmentMethod: "delivery",
      deliveryAddress: {
        recipientName: "Jane Doe",
        phone: "08030000000",
        addressLine: "12 Independence Avenue",
        city: "Enugu",
        state: "Enugu",
      },
    });
    expect(JSON.parse(JSON.stringify(request))).not.toHaveProperty(
      "totalMinorUnits",
    );
  });

  it("forwards a pickup checkout without any address (PRD R3)", () => {
    const request = JSON.parse(
      JSON.stringify(
        pickCheckoutRequest({
          cartId: "cart-1",
          fulfilmentMethod: "pickup",
          pickupLocationId: "loc-1",
          deliveryAddress: { city: "Enugu" },
        }),
      ),
    );
    expect(request).toEqual({
      cartId: "cart-1",
      fulfilmentMethod: "pickup",
      pickupLocationId: "loc-1",
    });
  });

  it("drops an unrecognised fulfilment method so Duka returns its own message", () => {
    const request = JSON.parse(
      JSON.stringify(
        pickCheckoutRequest({ cartId: "c", fulfilmentMethod: "drone" }),
      ),
    );
    expect(request).toEqual({ cartId: "c" });
  });

  it("tolerates a non-object body", () => {
    expect(JSON.parse(JSON.stringify(pickCheckoutRequest("nope")))).toEqual({});
  });
});

describe("availableMethods (PRD R1)", () => {
  it("lists only what the store offers", () => {
    expect(availableMethods(store({}))).toEqual(["delivery", "pickup"]);
    expect(availableMethods(store({ pickup: { available: false } }))).toEqual([
      "delivery",
    ]);
    expect(availableMethods(store({ delivery: { enabled: false } }))).toEqual([
      "pickup",
    ]);
    expect(
      availableMethods(
        store({ delivery: { enabled: false }, pickup: { available: false } }),
      ),
    ).toEqual([]);
  });
});

describe("deliveryCharge (PRD R4)", () => {
  it("returns the flat fee, including zero for free delivery", () => {
    expect(deliveryCharge(store({}), "delivery")).toEqual({
      kind: "fee",
      minorUnits: 200000,
    });
    expect(
      deliveryCharge(
        store({
          delivery: { enabled: true, feeMode: "flat", feeMinorUnits: 0 },
        }),
        "delivery",
      ),
    ).toEqual({ kind: "fee", minorUnits: 0 });
  });

  it("returns the merchant note in note mode", () => {
    expect(
      deliveryCharge(
        store({
          delivery: { enabled: true, feeMode: "note", note: "Pay the rider." },
        }),
        "delivery",
      ),
    ).toEqual({ kind: "note", note: "Pay the rider." });
  });

  it("charges nothing for pickup or before a choice is made", () => {
    expect(deliveryCharge(store({}), "pickup")).toBeNull();
    expect(deliveryCharge(store({}), null)).toBeNull();
    expect(deliveryCharge(undefined, "delivery")).toBeNull();
  });
});

describe("NIGERIAN_STATES (PRD R2)", () => {
  it("has the 36 states plus FCT, no duplicates", () => {
    expect(NIGERIAN_STATES).toHaveLength(37);
    expect(new Set(NIGERIAN_STATES).size).toBe(37);
    expect(NIGERIAN_STATES).toContain("FCT");
  });
});

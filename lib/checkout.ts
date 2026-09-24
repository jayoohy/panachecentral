import type {
  CheckoutRequest,
  DeliveryAddress,
  FulfilmentMethod,
  StoreInfo,
} from "@/lib/duka/types";

// Pure checkout helpers shared by the checkout form (client) and the checkout
// proxy route (server). No I/O here, so it's all unit-tested in checkout.test.ts.

const ADDRESS_FIELDS = [
  "recipientName",
  "phone",
  "addressLine",
  "city",
  "state",
  "landmark",
] as const;

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

/**
 * Server-side allowlist for POST /api/storefront/checkout: copies only the
 * documented §5.9 fields, as trimmed strings, and drops everything else — so a
 * browser can't smuggle extra fields (e.g. savedAddressId, which needs the
 * account flow we don't offer yet) through our proxy to Duka. Duka still does
 * the real validation and returns shopper-facing messages.
 */
export function pickCheckoutRequest(body: unknown): CheckoutRequest {
  const input = (body && typeof body === "object" ? body : {}) as Record<
    string,
    unknown
  >;
  const method =
    input.fulfilmentMethod === "delivery" || input.fulfilmentMethod === "pickup"
      ? input.fulfilmentMethod
      : undefined;

  const request: Partial<CheckoutRequest> = {
    cartId: text(input.cartId),
    customerName: text(input.customerName),
    customerEmail: text(input.customerEmail),
    customerPhone: text(input.customerPhone),
    returnUrl: text(input.returnUrl),
    fulfilmentMethod: method,
  };

  if (
    method === "delivery" &&
    input.deliveryAddress &&
    typeof input.deliveryAddress === "object"
  ) {
    const raw = input.deliveryAddress as Record<string, unknown>;
    const address: Record<string, string> = {};
    for (const field of ADDRESS_FIELDS) {
      const value = text(raw[field]);
      if (value !== undefined) address[field] = value;
    }
    request.deliveryAddress = address as DeliveryAddress;
  }
  if (method === "pickup")
    request.pickupLocationId = text(input.pickupLocationId);

  // Undefined keys vanish in JSON.stringify, so Duka sees only what was sent.
  return request as CheckoutRequest;
}

/** Which fulfilment methods the store currently offers, in display order. */
export function availableMethods(store: StoreInfo): FulfilmentMethod[] {
  const methods: FulfilmentMethod[] = [];
  if (store.delivery.enabled) methods.push("delivery");
  if (store.pickup.available) methods.push("pickup");
  return methods;
}

export type DeliveryCharge =
  | { kind: "fee"; minorUnits: number }
  | { kind: "note"; note: string }
  | null;

/** What the summary shows for the chosen method: a flat fee (0 = free), the merchant's note, or nothing (pickup). */
export function deliveryCharge(
  store: StoreInfo | undefined,
  method: FulfilmentMethod | null,
): DeliveryCharge {
  if (!store || method !== "delivery" || !store.delivery.enabled) return null;
  return store.delivery.feeMode === "flat"
    ? { kind: "fee", minorUnits: store.delivery.feeMinorUnits }
    : { kind: "note", note: store.delivery.note };
}

export const EMPTY_ADDRESS: DeliveryAddress = {
  recipientName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  landmark: "",
};

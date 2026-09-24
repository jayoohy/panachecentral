"use client";

import { useState } from "react";
import { useStoreInfo } from "@/hooks/useStoreInfo";
import {
  EMPTY_ADDRESS,
  availableMethods,
  deliveryCharge,
} from "@/lib/checkout";
import type { DeliveryAddress, FulfilmentMethod } from "@/lib/duka/types";

/**
 * Checkout's delivery-or-pickup state (PRD R1–R4). Owned by the checkout page
 * so both the form and the order summary read the same choice.
 */
export function useCheckoutFulfilment() {
  const store = useStoreInfo();
  const [chosen, setMethod] = useState<FulfilmentMethod | null>(null);
  const [address, setAddress] = useState<DeliveryAddress>(EMPTY_ADDRESS);
  const [pickupLocationId, setPickupLocationId] = useState("");

  const methods = store.data ? availableMethods(store.data) : [];
  // A single available option is preselected; a choice the store withdrew is ignored.
  const method =
    chosen && methods.includes(chosen)
      ? chosen
      : methods.length === 1
        ? methods[0]
        : null;

  return {
    store,
    methods,
    method,
    setMethod,
    address,
    updateAddress: (field: keyof DeliveryAddress, value: string) =>
      setAddress((previous) => ({ ...previous, [field]: value })),
    pickupLocationId,
    setPickupLocationId,
    charge: deliveryCharge(store.data, method),
  };
}

export type CheckoutFulfilment = ReturnType<typeof useCheckoutFulfilment>;

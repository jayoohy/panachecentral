"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useCartStore } from "@/lib/store/cart-store";
import type { CheckoutResponse } from "@/lib/duka/types";

export type CheckoutInput = {
  cartId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl?: string;
};

export function useCheckout() {
  const setCartId = useCartStore((state) => state.setCartId);

  return useMutation({
    mutationFn: (input: CheckoutInput) =>
      apiFetch<CheckoutResponse>("/api/storefront/checkout", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      // The cart id is invalid after checkout regardless of payment outcome
      // (docs/storefront-api.md §5.9) — a subsequent visit gets a fresh cart.
      setCartId(null);
    },
  });
}

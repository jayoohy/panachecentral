"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useCartStore } from "@/lib/store/cart-store";
import type { Cart } from "@/lib/duka/types";

const cartKey = (cartId: string | null) => ["cart", cartId] as const;

/**
 * The single cart implementation the design spec calls for (§5 CartView) —
 * creates a cart on first use, persists the id (via useCartStore), and
 * recovers from a stale/expired cart id by creating a fresh one.
 */
export function useCart() {
  const cartId = useCartStore((state) => state.cartId);
  const setCartId = useCartStore((state) => state.setCartId);
  const queryClient = useQueryClient();

  const createCart = useMutation({
    mutationFn: () => apiFetch<Cart>("/api/storefront/cart", { method: "POST" }),
    onSuccess: (cart) => {
      setCartId(cart.id);
      queryClient.setQueryData(cartKey(cart.id), cart);
    },
  });

  const { mutate: createCartMutate, status: createStatus } = createCart;

  useEffect(() => {
    // Read the live store, not the render value: during hydration React renders
    // with the store's initial (server) snapshot, cartId: null, even though the
    // persisted id is already loaded — trusting it created a fresh, empty cart on
    // every full page load (docs/pm/tickets/cart-lost-on-reload.md).
    if (!useCartStore.getState().cartId && createStatus === "idle") {
      createCartMutate();
    }
  }, [cartId, createStatus, createCartMutate]);

  const query = useQuery({
    queryKey: cartKey(cartId),
    queryFn: () => apiFetch<Cart>(`/api/storefront/cart/${cartId}`),
    enabled: Boolean(cartId),
  });

  useEffect(() => {
    if (query.error instanceof ApiError && query.error.status === 404 && cartId) {
      // Cart id is stale (expired/invalid) — drop it and let the effect
      // above create a fresh one.
      setCartId(null);
    }
  }, [query.error, cartId, setCartId]);

  return {
    cart: query.data,
    isLoading: !cartId || query.isLoading || createCart.isPending,
    error: query.error,
  };
}

export function useUpdateCartItem() {
  const cartId = useCartStore((state) => state.cartId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: { productVariantId: string; quantity: number }) =>
      apiFetch<Cart>(`/api/storefront/cart/${cartId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    onSuccess: (cart) => queryClient.setQueryData(cartKey(cartId), cart),
  });
}

export function useApplyCoupon() {
  const cartId = useCartStore((state) => state.cartId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) =>
      apiFetch<Cart>(`/api/storefront/cart/${cartId}/coupon`, {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    onSuccess: (cart) => queryClient.setQueryData(cartKey(cartId), cart),
  });
}

export function useRemoveCoupon() {
  const cartId = useCartStore((state) => state.cartId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch<Cart>(`/api/storefront/cart/${cartId}/coupon`, { method: "DELETE" }),
    onSuccess: (cart) => queryClient.setQueryData(cartKey(cartId), cart),
  });
}

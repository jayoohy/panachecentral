"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useCart, useUpdateCartItem } from "@/hooks/useCart";
import { useQuickViewStore } from "@/lib/store/quick-view-store";
import type { ProductDetail } from "@/lib/duka/types";

/**
 * "Add to Cart" straight from a product card, with no variant picker on the card itself.
 * A product with exactly one in-stock variant adds directly; one that needs a real choice
 * (color, size, ...), has none in stock, or fails to load opens Quick Look instead of
 * guessing which variant the shopper meant.
 */
export function useQuickAddToCart() {
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [addedSlug, setAddedSlug] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { cart } = useCart();
  const updateItem = useUpdateCartItem();
  const openQuickView = useQuickViewStore((state) => state.open);

  async function addToCart(slug: string) {
    setPendingSlug(slug);
    try {
      const product = await queryClient.fetchQuery({
        queryKey: ["product", slug],
        queryFn: () => apiFetch<ProductDetail>(`/api/storefront/products/${encodeURIComponent(slug)}`),
      });

      const [onlyVariant] = product.variants;
      if (product.variants.length !== 1 || onlyVariant.stock === 0) {
        openQuickView(slug);
        return;
      }

      const existingQuantity = cart?.items.find((item) => item.productVariantId === onlyVariant.id)?.quantity ?? 0;
      await updateItem.mutateAsync({ productVariantId: onlyVariant.id, quantity: existingQuantity + 1 });
      setAddedSlug(slug);
      setTimeout(() => setAddedSlug((current) => (current === slug ? null : current)), 1600);
    } catch {
      openQuickView(slug);
    } finally {
      setPendingSlug(null);
    }
  }

  return { addToCart, pendingSlug, addedSlug };
}

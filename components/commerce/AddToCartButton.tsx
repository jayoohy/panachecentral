"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { useCart, useUpdateCartItem } from "@/hooks/useCart";
import { useCartStore } from "@/lib/store/cart-store";
import { quantityInCart, remainingStock } from "@/lib/cart-stock";
import type { ProductVariant } from "@/lib/duka/types";

/**
 * Wraps Button (primary-gold, the one high-emphasis action on the product
 * page) and owns the add itself, so the product page and Quick Look share one
 * stock check. On success, text-swaps to "Added to Cart" for ~1.6s then reverts:
 * no toast, no modal, lowest-overhead confirmation (design spec §5).
 */
export function AddToCartButton({
  variant,
  missing = [],
}: {
  variant: ProductVariant | undefined;
  /** Labels of options the shopper still has to pick; while any remain, nothing is added. */
  missing?: string[];
}) {
  const cartId = useCartStore((state) => state.cartId);
  const { cart } = useCart();
  const updateItem = useUpdateCartItem();
  const [justAdded, setJustAdded] = useState(false);

  const needsChoice = missing.length > 0;
  const outOfStock = !needsChoice && (!variant || variant.stock === 0);
  const inCart = variant ? quantityInCart(cart, variant.id) : 0;
  const allInCart = !!variant && !outOfStock && remainingStock(variant, cart) === 0;
  const label = needsChoice
    ? "Select an Option"
    : outOfStock
      ? "Out of Stock"
      : allInCart
        ? "All in Your Cart"
        : "Add to Cart";

  async function handleClick() {
    if (!variant || needsChoice || !cartId || allInCart) return;
    try {
      // PATCH sets an absolute quantity, not a delta (docs/storefront-api.md §5.6).
      await updateItem.mutateAsync({ productVariantId: variant.id, quantity: inCart + 1 });
    } catch {
      return; // updateItem.isError renders the message below
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <div>
      <Button
        variant="primary-gold"
        className="w-full"
        onClick={handleClick}
        disabled={needsChoice || outOfStock || allInCart || !cartId}
        loading={updateItem.isPending}
      >
        <span className="t-text-swap" data-state={justAdded ? "b" : "a"}>
          <span data-slot="a">{label}</span>
          <span data-slot="b">Added to Cart</span>
        </span>
      </Button>
      {needsChoice && (
        <p className="mt-3 text-xs text-bone/60">Select {missing.join(" and ")} to add this to your cart.</p>
      )}
      {allInCart && (
        <p className="mt-3 text-xs text-bone/60">
          You have all {inCart} available in your cart.
        </p>
      )}
      {updateItem.isError && !allInCart && (
        <p role="alert" className="mt-3 text-xs text-error">
          We couldn&apos;t add this to your cart. Please try again.
        </p>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";

/**
 * Wraps Button (primary-gold — the one high-emphasis action on the product
 * page). On success, text-swaps to "Added to Cart" for ~1.6s then reverts —
 * no toast, no modal, lowest-overhead confirmation (design spec §5).
 */
export function AddToCartButton({
  onAdd,
  outOfStock,
  loading,
}: {
  onAdd: () => Promise<unknown> | void;
  outOfStock?: boolean;
  loading?: boolean;
}) {
  const [justAdded, setJustAdded] = useState(false);

  async function handleClick() {
    await onAdd();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <Button
      variant="primary-gold"
      className="w-full"
      onClick={handleClick}
      disabled={outOfStock}
      loading={loading}
    >
      <span className="t-text-swap" data-state={justAdded ? "b" : "a"}>
        <span data-slot="a">{outOfStock ? "Out of Stock" : "Add to Cart"}</span>
        <span data-slot="b">Added to Cart</span>
      </span>
    </Button>
  );
}

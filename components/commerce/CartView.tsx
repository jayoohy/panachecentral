"use client";

import Link from "next/link";
import { useCart, useUpdateCartItem } from "@/hooks/useCart";
import { CartLineItem } from "@/components/commerce/CartLineItem";
import { CartSummary } from "@/components/commerce/CartSummary";
import { CouponForm } from "@/components/commerce/CouponForm";
import { EmptyState } from "@/components/shared/EmptyState";
import { buttonClassName } from "@/components/shared/Button";

/**
 * The single cart implementation (design spec §4/§5) — rendered inside both
 * CartDrawer and the /cart page shell, so there's exactly one "what a cart
 * looks like."
 */
export function CartView() {
  const { cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();

  if (isLoading) {
    return (
      <div className="space-y-4 p-6" aria-busy="true" aria-label="Loading cart">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-none bg-surface" />
        ))}
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        heading="Your cart is empty."
        body="Every piece here is made to be worn, not just bought."
        cta={{ label: "Browse the Collection", href: "/shop" }}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 divide-y divide-bone/10 overflow-y-auto px-6">
        {cart.items.map((item) => (
          <CartLineItem
            key={item.productVariantId}
            item={item}
            pending={updateItem.isPending && updateItem.variables?.productVariantId === item.productVariantId}
            onQuantityChange={(quantity) =>
              updateItem.mutate({ productVariantId: item.productVariantId, quantity })
            }
          />
        ))}
      </div>
      <div className="space-y-4 border-t border-bone/10 px-6 py-5">
        <CouponForm couponCode={cart.couponCode} />
        <CartSummary cart={cart} />
        <Link href="/checkout" className={buttonClassName("primary-gold", "w-full")}>
          Checkout
        </Link>
      </div>
    </div>
  );
}

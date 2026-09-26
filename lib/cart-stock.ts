import type { Cart, ProductVariant } from "@/lib/duka/types";

export function quantityInCart(cart: Cart | undefined, variantId: string) {
  return cart?.items.find((item) => item.productVariantId === variantId)?.quantity ?? 0;
}

/** Units of this variant the shopper can still add: stock on hand minus what's already in their cart. */
export function remainingStock(variant: ProductVariant, cart: Cart | undefined) {
  return Math.max(0, variant.stock - quantityInCart(cart, variant.id));
}

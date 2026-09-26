import { describe, expect, it } from "vitest";
import { remainingStock } from "./cart-stock";
import type { Cart, ProductVariant } from "@/lib/duka/types";

const variant = { id: "v1", stock: 3 } as ProductVariant;
const cartWith = (quantity: number) => ({ items: [{ productVariantId: "v1", quantity }] }) as Cart;

describe("remainingStock", () => {
  it("is the full stock when the variant isn't in the cart", () => {
    expect(remainingStock(variant, undefined)).toBe(3);
  });

  it("subtracts what's already in the cart", () => {
    expect(remainingStock(variant, cartWith(2))).toBe(1);
  });

  it("never goes below zero when the cart holds more than stock", () => {
    expect(remainingStock(variant, cartWith(5))).toBe(0);
  });
});

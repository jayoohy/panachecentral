import { describe, expect, it } from "vitest";
import { productSchema } from "./schema";
import { truncate } from "@/lib/site";
import type { ProductDetail } from "@/lib/duka/types";

const product: ProductDetail = {
  id: "1",
  name: "Test Ring",
  slug: "test-ring",
  description: "A ring.",
  status: "active",
  category: { id: "c", name: "Rings", slug: "rings" },
  images: ["https://cdn.test/a.jpg"],
  variants: [
    { id: "v1", sku: "R-1", barcode: null, priceMinorUnits: 1500000, attributeValues: {}, stock: 3 },
    { id: "v2", sku: "R-2", barcode: null, priceMinorUnits: 1550050, attributeValues: {}, stock: 0 },
  ],
};

describe("productSchema", () => {
  it("emits one Offer per variant with major-unit prices and stock-based availability", () => {
    const offers = productSchema(product).offers as { price: string; availability: string; priceCurrency: string }[];
    expect(offers.map((o) => o.price)).toEqual(["15000.00", "15500.50"]);
    expect(offers.map((o) => o.availability)).toEqual([
      "https://schema.org/InStock",
      "https://schema.org/OutOfStock",
    ]);
    expect(offers[0].priceCurrency).toBe("NGN");
  });
});

describe("truncate", () => {
  it("leaves short text alone and cuts long text on a word boundary", () => {
    expect(truncate("short")).toBe("short");
    const cut = truncate("word ".repeat(60), 40);
    expect(cut.length).toBeLessThanOrEqual(40);
    expect(cut.endsWith("…")).toBe(true);
  });
});

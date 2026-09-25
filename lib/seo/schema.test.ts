import { describe, expect, it } from "vitest";
import { productDescription, productSchema } from "./schema";
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

describe("productDescription", () => {
  it("uses the catalog HTML as plain text when present", () => {
    expect(productDescription({ ...product, description: "<p>Gold &amp; steel.</p><p>Hand set.</p>" })).toBe(
      "Gold & steel. Hand set."
    );
  });

  it("falls back to name, category and lowest price when the catalog has no description", () => {
    expect(productDescription({ ...product, description: null })).toMatch(/^Test Ring in Rings at Panache Central\. From .*15,000/);
  });
});

describe("truncate on null", () => {
  it("returns an empty string instead of throwing (llms.txt 500 on 2026-09-25)", () => {
    expect(truncate(null)).toBe("");
  });
});

describe("productDescription with API meta fields", () => {
  const html =
    "<p>A&nbsp;stretch&nbsp;bracelet&nbsp;strung&nbsp;with&nbsp;6mm&nbsp;beads&nbsp;—&nbsp;simple,&nbsp;stackable,&nbsp;and&nbsp;comfortable&nbsp;for&nbsp;all-day&nbsp;wear.</p>";
  // Verbatim production fallback: raw 160-char slice, entity cut in half.
  const apiFallback =
    "A&nbsp;stretch&nbsp;bracelet&nbsp;strung&nbsp;with&nbsp;6mm&nbsp;beads&nbsp;—&nbsp;simple,&nbsp;stackable,&nbsp;and&nbsp;comfortable&nbsp;for&nbsp;all-day&nbsp…";

  it("ignores the API's auto-excerpt and uses the full description instead", () => {
    expect(productDescription({ ...product, description: html, metaDescription: apiFallback })).toBe(
      "A stretch bracelet strung with 6mm beads — simple, stackable, and comfortable for all-day wear."
    );
  });

  it("prefers a merchant-written meta description", () => {
    expect(productDescription({ ...product, description: html, metaDescription: "Gold beaded bracelet, 18cm." })).toBe(
      "Gold beaded bracelet, 18cm."
    );
  });
});

describe("productSchema extras", () => {
  it("adds material/colour from variant options and omits rating with no reviews", () => {
    const schema = productSchema({
      ...product,
      attributes: [
        { key: "material_purity", label: "Material/Purity" },
        { key: "colour_finish", label: "Colour/Finish" },
      ],
      variants: [{ ...product.variants[0], attributeValues: { material_purity: "18K", colour_finish: "Gold", supplier_sku: "X" } }],
      reviewCount: 0,
      averageRating: null,
    });
    expect(schema.material).toBe("18K");
    expect(schema.color).toBe("Gold");
    expect(schema.aggregateRating).toBeUndefined();
  });
});

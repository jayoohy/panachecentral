import { describe, expect, it } from "vitest";
import { missingChoices, resolveSelectedVariant, variantPriceLabel, variantRegularPriceLabel } from "./variants";
import type { ProductVariant } from "@/lib/duka/types";

const variant = (id: string, attributeValues: Record<string, string>, priceMinorUnits = 1500000) =>
  ({ id, attributeValues, priceMinorUnits, stock: 1 }) as ProductVariant;

const sized = [
  variant("s", { size: "S", finish: "Gold" }),
  variant("m", { size: "M", finish: "Gold" }, 1800000),
];

describe("resolveSelectedVariant", () => {
  it("resolves nothing until the shopper picks, instead of defaulting to the first variant", () => {
    expect(resolveSelectedVariant(sized, {})).toBeUndefined();
    expect(missingChoices(sized, {})).toEqual(["size"]);
  });

  it("resolves the picked variant once every real choice is made", () => {
    expect(resolveSelectedVariant(sized, { size: "M" })?.id).toBe("m");
  });

  it("resolves a single-variant product without any selection", () => {
    expect(resolveSelectedVariant([variant("only", { length: "18cm" })], {})?.id).toBe("only");
  });
});

describe("variantPriceLabel", () => {
  it("shows the range before a choice and the exact price after", () => {
    expect(variantPriceLabel(sized, undefined)).toMatch(/15,000.*18,000/);
    expect(variantPriceLabel(sized, sized[1])).toMatch(/18,000/);
  });
});

describe("variantRegularPriceLabel", () => {
  const onSale = { ...variant("sale", { size: "S" }, 1200000), regularPriceMinorUnits: 1500000 };
  const fullPrice = variant("full", { size: "M" }, 1800000);

  it("is empty when nothing is on sale", () => {
    expect(variantRegularPriceLabel(sized, undefined)).toBe("");
    expect(variantRegularPriceLabel(sized, sized[0])).toBe("");
  });

  it("shows the selected variant's regular price, or the pre-sale range before a choice", () => {
    expect(variantRegularPriceLabel([onSale, fullPrice], onSale)).toMatch(/15,000/);
    expect(variantRegularPriceLabel([onSale, fullPrice], fullPrice)).toBe("");
    expect(variantRegularPriceLabel([onSale, fullPrice], undefined)).toMatch(/15,000.*18,000/);
  });
});

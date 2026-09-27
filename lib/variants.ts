import { formatMoney, formatPriceRange } from "@/lib/format-money";
import type { ProductVariant } from "@/lib/duka/types";

/**
 * Attribute keys the shopper actually has to choose. A key with only one distinct value across
 * variants (a single-variant product's "length", an SKU-style attribute) isn't a decision.
 */
export function variantChoiceKeys(variants: ProductVariant[]) {
  return Array.from(new Set(variants.flatMap((variant) => Object.keys(variant.attributeValues)))).filter(
    (key) => new Set(variants.map((variant) => variant.attributeValues[key]).filter(Boolean)).size > 1
  );
}

/** Choice keys the shopper hasn't picked yet. Empty means the selection is complete. */
export function missingChoices(variants: ProductVariant[], selected: Record<string, string>) {
  return variantChoiceKeys(variants).filter((key) => !selected[key]);
}

/**
 * The variant the shopper picked, or undefined until every real choice is made. Never falls
 * back to variants[0]: adding an option nobody chose is the bug this exists to prevent.
 * A product with no real choices resolves to its first variant immediately.
 */
export function resolveSelectedVariant(variants: ProductVariant[], selected: Record<string, string>) {
  const keys = variantChoiceKeys(variants);
  if (keys.some((key) => !selected[key])) return undefined;
  return variants.find((variant) => keys.every((key) => variant.attributeValues[key] === selected[key]));
}

/** Merchant label for an option key ("material_purity" -> "Material/Purity"), falling back to the key with spaces. */
export function attributeLabel(attributes: { key: string; label: string }[] | undefined, key: string) {
  return attributes?.find((attribute) => attribute.key === key)?.label ?? key.replace(/_/g, " ");
}

/** The chosen variant's price, or the product's price range until a choice is made. */
export function variantPriceLabel(variants: ProductVariant[], selected: ProductVariant | undefined) {
  if (selected) return formatMoney(selected.priceMinorUnits);
  if (variants.length === 0) return "";
  const prices = variants.map((variant) => variant.priceMinorUnits);
  return formatPriceRange({ minPriceMinorUnits: Math.min(...prices), maxPriceMinorUnits: Math.max(...prices) });
}

/** The pre-sale counterpart of variantPriceLabel, "" when nothing in scope is on sale. */
export function variantRegularPriceLabel(variants: ProductVariant[], selected: ProductVariant | undefined) {
  if (selected) return selected.regularPriceMinorUnits ? formatMoney(selected.regularPriceMinorUnits) : "";
  if (!variants.some((variant) => variant.regularPriceMinorUnits)) return "";
  const prices = variants.map((variant) => variant.regularPriceMinorUnits ?? variant.priceMinorUnits);
  return formatPriceRange({ minPriceMinorUnits: Math.min(...prices), maxPriceMinorUnits: Math.max(...prices) });
}

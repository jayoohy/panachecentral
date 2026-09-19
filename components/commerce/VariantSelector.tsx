"use client";

import type { ProductVariant } from "@/lib/duka/types";

/**
 * Groups variants by their shared attribute keys (e.g. color, size) and
 * renders one pill row per attribute. Selection is tracked per attribute key
 * so multi-attribute products (color + size) resolve correctly — the parent
 * derives the matching variant from the full selectedAttributes map (see
 * app/products/[slug]/ProductDetailView.tsx). Real <button>s with
 * aria-pressed; out-of-stock options are disabled with visible + screen-
 * reader text, never color alone (design spec §7).
 */
export function VariantSelector({
  variants,
  selectedAttributes,
  onSelectAttribute,
}: {
  variants: ProductVariant[];
  selectedAttributes: Record<string, string>;
  onSelectAttribute: (key: string, value: string) => void;
}) {
  const attributeKeys = Array.from(
    new Set(variants.flatMap((variant) => Object.keys(variant.attributeValues)))
  );

  if (attributeKeys.length === 0) return null;

  return (
    <div className="space-y-4">
      {attributeKeys.map((key) => {
        const values = Array.from(
          new Set(variants.map((variant) => variant.attributeValues[key]).filter(Boolean))
        );

        return (
          <div key={key}>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-bone/60">{key}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {values.map((value) => {
                const isSelected = selectedAttributes[key] === value;
                // A value is "available" if at least one variant combining it
                // with the other currently-selected attributes is in stock.
                const availableForCurrentSelection = variants.some((variant) => {
                  if (variant.attributeValues[key] !== value) return false;
                  const matchesOtherSelections = Object.entries(selectedAttributes).every(
                    ([otherKey, otherValue]) =>
                      otherKey === key || variant.attributeValues[otherKey] === otherValue
                  );
                  return matchesOtherSelections && variant.stock > 0;
                });

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isSelected}
                    aria-disabled={!availableForCurrentSelection}
                    disabled={!availableForCurrentSelection}
                    onClick={() => onSelectAttribute(key, value)}
                    className={`t-press min-h-11 min-w-14 border px-4 py-2 text-sm transition-colors duration-300 ${
                      isSelected
                        ? "border-gold bg-gold font-semibold text-onyx"
                        : "border-bone/20 bg-surface hover:border-gold"
                    } ${!availableForCurrentSelection ? "cursor-not-allowed text-bone/30 line-through" : isSelected ? "" : "text-bone"}`}
                  >
                    {value}
                    {!availableForCurrentSelection && <span className="sr-only"> — Out of stock</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

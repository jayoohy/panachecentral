"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProduct } from "@/hooks/useProduct";
import { useQuickViewStore } from "@/lib/store/quick-view-store";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { attributeLabel, missingChoices, resolveSelectedVariant, variantPriceLabel, variantRegularPriceLabel } from "@/lib/variants";
import { PriceTag } from "@/components/commerce/PriceTag";
import { cleanHtml } from "@/lib/site";
import { VariantSelector } from "@/components/commerce/VariantSelector";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { ProductGallery } from "@/components/commerce/ProductGallery";
import type { ProductDetail } from "@/lib/duka/types";

/**
 * Product detail in a panel, so a shopper can see the full listing and add to cart
 * without leaving the grid. Mounted once (see app/layout.tsx); any ProductCard opens
 * it by calling useQuickViewStore's `open(slug)`.
 */
export function QuickViewModal() {
  const slug = useQuickViewStore((state) => state.slug);
  const close = useQuickViewStore((state) => state.close);
  const isOpen = slug !== null;

  const { data: product, isLoading } = useProduct(slug);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-onyx/70 p-4" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={product ? product.name : "Quick look"}
        onClick={(event) => event.stopPropagation()}
        className="flex max-h-[85dvh] w-full max-w-sm flex-col overflow-x-hidden overflow-y-auto border border-bone/10 bg-onyx sm:max-w-2xl"
      >
        <div className="flex items-center justify-between border-b border-bone/10 px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/60">Quick Look</p>
          <button
            type="button"
            onClick={close}
            aria-label="Close quick look"
            className="t-press flex h-9 w-9 items-center justify-center text-lg text-bone"
          >
            ×
          </button>
        </div>

        {isLoading || !product ? (
          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
            <div className="mx-auto h-48 w-48 animate-pulse bg-surface sm:mx-0 sm:aspect-square sm:h-auto sm:w-full" />
            <div className="space-y-3">
              <div className="h-5 w-2/3 animate-pulse bg-surface" />
              <div className="h-4 w-1/3 animate-pulse bg-surface" />
            </div>
          </div>
        ) : (
          // Keyed by id so switching to a different product resets the variant
          // selection by remounting, instead of an effect resetting state.
          <QuickViewProduct key={product.id} product={product} onClose={close} />
        )}
      </div>
    </div>
  );
}

function QuickViewProduct({ product, onClose }: { product: ProductDetail; onClose: () => void }) {
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  const selectedVariant = resolveSelectedVariant(product.variants, selectedAttributes);
  const labelFor = (key: string) => attributeLabel(product.attributes, key);
  const priceLabel = variantPriceLabel(product.variants, selectedVariant);
  const regularPriceLabel = variantRegularPriceLabel(product.variants, selectedVariant);
  const discountLabel = (selectedVariant ?? product).discount?.label;

  return (
    <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:gap-8 sm:p-6">
      <div className="mx-auto w-48 sm:mx-0 sm:w-full">
        <ProductGallery images={product.images} productName={product.name} compact />
      </div>
      <div>
        {product.category && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{product.category.name}</p>
        )}
        <p className="mt-2 font-serif text-xl text-bone sm:text-2xl">{product.name}</p>
        {priceLabel && (
          <p className="mt-2 text-base font-light tracking-[0.08em] text-bone sm:mt-3 sm:text-lg">
            <PriceTag price={priceLabel} regularPrice={regularPriceLabel} discountLabel={discountLabel} />
          </p>
        )}
        {/* Quick Look is meant to stay compact — clamp the description rather than
            let it push the panel toward full-page length; the full text is one tap
            away via "View full details". */}
        <div
          className="mt-3 line-clamp-3 text-sm leading-[1.6] text-bone/80 sm:mt-4 sm:text-[0.9375rem] sm:leading-[1.75]"
          dangerouslySetInnerHTML={{ __html: cleanHtml(product.description) }}
        />

        <div className="mt-4 sm:mt-6">
          <VariantSelector
            variants={product.variants}
            selectedAttributes={selectedAttributes}
            labelFor={labelFor}
            onSelectAttribute={(key, value) => setSelectedAttributes((prev) => ({ ...prev, [key]: value }))}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:mt-6">
          <AddToCartButton
            variant={selectedVariant}
            missing={missingChoices(product.variants, selectedAttributes).map(labelFor)}
          />
          <Link
            href={`/products/${product.slug}`}
            onClick={onClose}
            className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-bone/60 hover:text-gold"
          >
            View full details
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import type { ProductSummary } from "@/lib/duka/types";
import { useQuickAddToCart } from "@/hooks/useQuickAddToCart";
import { useQuickViewStore } from "@/lib/store/quick-view-store";
import { formatPriceRange } from "@/lib/format-money";

/**
 * Stitch shop tile: a dark vitrine frame with the category label over the
 * photograph, then the name and price (a min – max range when variants
 * differ, docs/storefront-api.md §5.2).
 *
 * The whole card navigates to the product page via a "stretched link" — the
 * visible <Link> only wraps the title text, but its ::before covers the full
 * card — because the Quick Look and Add to Cart buttons need to stay
 * independently clickable, and a <button> nested inside an <a> is both
 * invalid HTML and breaks keyboard/screen-reader navigation.
 *
 * ponytail: plain <img>, not next/image — the tenant's media host is
 * unknown/configurable, so next.config.ts can't allowlist it yet. Switch to
 * next/image once the real CDN domain is known.
 */
export function ProductCard({ product }: { product: ProductSummary }) {
  const { addToCart, pendingSlug, addedSlug } = useQuickAddToCart();
  const openQuickView = useQuickViewStore((state) => state.open);
  const isAdding = pendingSlug === product.slug;
  const justAdded = addedSlug === product.slug;

  return (
    <div className="group relative">
      <div className="border border-bone/10 bg-surface p-2.5 transition-colors duration-500 group-hover:border-gold sm:p-4">
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-bone/60 sm:text-[0.6875rem] sm:tracking-[0.18em]">
          {product.category?.name ?? " "}
        </p>
        <div className="relative mt-3 aspect-square overflow-hidden bg-onyx sm:mt-4">
          {product.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.thumbnail}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[0.6875rem] uppercase tracking-[0.18em] text-bone/30">
              No image
            </div>
          )}

          <button
            type="button"
            onClick={() => openQuickView(product.slug)}
            aria-label={`Quick look: ${product.name}`}
            className="t-press absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center border border-bone/20 bg-onyx/80 text-bone backdrop-blur-sm transition-colors hover:border-gold hover:text-gold sm:h-9 sm:w-9"
          >
            <EyeIcon />
          </button>
        </div>
        <p className="mt-3 font-serif text-base text-bone sm:mt-4 sm:text-xl">
          <Link
            href={`/products/${product.slug}`}
            className="before:absolute before:inset-0 before:content-[''] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[3px] focus-visible:outline-gold"
          >
            {product.name}
          </Link>
        </p>
        <p className="mt-1 text-xs tabular-nums text-bone/70 sm:text-sm">
          {product.stock === 0 ? "Sold out" : formatPriceRange(product)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => addToCart(product.slug)}
        disabled={isAdding}
        className="t-press relative z-10 mt-2 flex w-full items-center justify-center gap-2 border border-bone/20 py-2 text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-bone/80 transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-50 sm:text-[0.6875rem] sm:tracking-[0.18em]"
      >
        {isAdding ? "Adding…" : justAdded ? "Added" : "Add to Cart"}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

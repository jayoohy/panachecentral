import Link from "next/link";
import type { ProductSummary } from "@/lib/duka/types";

/**
 * Stitch shop tile: a dark vitrine frame with a numbered label over the
 * photograph and the name below. No price: the listing endpoint doesn't
 * return it (docs/storefront-api.md §5.2) — shown on detail.
 *
 * ponytail: plain <img>, not next/image — the tenant's media host is
 * unknown/configurable, so next.config.ts can't allowlist it yet. Switch to
 * next/image once the real CDN domain is known.
 */
export function ProductCard({ product, index }: { product: ProductSummary; index: number }) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[3px] focus-visible:outline-gold"
    >
      <div className="border border-bone/10 bg-surface p-4 transition-colors duration-500 group-hover:border-gold">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-bone/60">
          No. {number}
          {product.category && ` / ${product.category.name}`}
        </p>
        <div className="relative mt-4 aspect-square overflow-hidden bg-onyx">
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
        </div>
      </div>
      <p className="mt-4 font-serif text-xl text-bone">{product.name}</p>
    </Link>
  );
}

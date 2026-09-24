import type { Ref } from "react";
import { ProductCard } from "@/components/commerce/ProductCard";
import type { ProductSummary } from "@/lib/duka/types";

// Card widths per design spec §6: next card peeks on mobile, 2-up tablet, 4-up desktop.
const ITEM =
  "w-[78%] shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)]";

/**
 * Horizontal product row: native overflow scrolling with scroll-snap, so
 * touch swipe, trackpad and shift+wheel all work without a carousel library.
 * Focusable so keyboard users can scroll it with the arrow keys.
 */
export function ProductRail({
  products,
  label,
  ref,
}: {
  products: ProductSummary[];
  label: string;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={ref}
      role="region"
      aria-label={label}
      tabIndex={0}
      className="-mx-1 snap-x snap-mandatory scroll-px-1 overflow-x-auto px-1 py-1 [scrollbar-width:none] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-gold [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex gap-4 sm:gap-6">
        {products.map((product) => (
          <li key={product.id} className={ITEM}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProductRailSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden sm:gap-6" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className={`${ITEM} aspect-4/5 animate-pulse bg-surface`}
        />
      ))}
    </div>
  );
}

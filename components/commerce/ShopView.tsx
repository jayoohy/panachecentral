"use client";

import { useRef, useState } from "react";
import { PageHeading } from "@/components/shared/PageHeading";
import { Reveal } from "@/components/shared/Reveal";
import { SectionKicker } from "@/components/shared/SectionKicker";
import { EmptyState } from "@/components/shared/EmptyState";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { CategoryChips } from "@/components/commerce/CategoryChips";
import { SearchField } from "@/components/commerce/SearchField";
import { Pagination } from "@/components/commerce/Pagination";
import { ProductCard } from "@/components/commerce/ProductCard";
import { useCategories } from "@/hooks/useCategories";
import { useProducts } from "@/hooks/useProducts";
import { isVisibleCategory } from "@/lib/constants";
import type { Category, Paginated, ProductSummary } from "@/lib/duka/types";

/**
 * Shared implementation for /shop and /shop/[categorySlug] — the design
 * spec's §4 IA notes these resolve to the same grid, just pre-filtered.
 */
export function ShopView({
  categorySlug,
  initialCategories,
  initialProducts,
}: {
  categorySlug?: string;
  initialCategories?: Category[];
  initialProducts?: Paginated<ProductSummary>;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data: categories } = useCategories(initialCategories);
  const activeCategory = categories?.find((category) => category.slug === categorySlug);
  const topRef = useRef<HTMLDivElement>(null);

  // Page-change previously left the visitor scrolled at the pagination control, looking
  // at the outgoing results until they scrolled back up manually (audit F7).
  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const breadcrumbItems = activeCategory
    ? [{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: activeCategory.name }]
    : [{ label: "Home", href: "/" }, { label: "Shop" }];

  // The server-rendered first page only applies to the unfiltered, unsearched view.
  const { data, isLoading } = useProducts(
    {
      page,
      categoryId: activeCategory?.id,
      search: search || undefined,
    },
    page === 1 && !search ? initialProducts : undefined
  );

  return (
    <div ref={topRef} className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
      <Breadcrumbs items={breadcrumbItems} />
      <SectionKicker>{activeCategory ? "The Collection" : "Shop the House"}</SectionKicker>
      <div className="mt-6">
        <PageHeading>{activeCategory ? activeCategory.name : "The Collection"}</PageHeading>
      </div>

      <div className="mt-10 flex flex-col gap-6 border-t border-bone/10 pt-8 sm:flex-row sm:items-end sm:justify-between">
        <CategoryChips categories={(categories ?? []).filter(isVisibleCategory)} activeSlug={categorySlug} />
        <div className="sm:w-72">
          <SearchField
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse bg-surface" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="mt-10">
          <EmptyState heading="No pieces match your search." body="Try a different term or explore by category." />
        </div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
            {data.items.map((product, index) => (
              // Stagger every other column (Stitch asymmetric grid) — offsets follow the column count.
              <Reveal key={product.id} delay={(index % 3) * 100} className="even:mt-12 lg:even:mt-0 lg:nth-[3n+2]:mt-12">
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={handlePageChange} />
        </>
      )}
    </div>
  );
}

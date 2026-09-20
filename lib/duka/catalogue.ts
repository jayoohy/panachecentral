import "server-only";

import { cache } from "react";
import { isVisibleProduct } from "@/lib/constants";
import { DukaApiError } from "./client";
import { getProduct, listCategories, listProducts } from "./storefront";
import type { Category, Paginated, ProductDetail, ProductSummary } from "./types";

// Server-render helpers for SEO surfaces (metadata, JSON-LD, sitemap, llms.txt).
// Wrapped in React `cache` so generateMetadata and the page share one request.
// Failures resolve to undefined instead of throwing, so a Duka outage degrades a
// page to its client-rendered path rather than a 500.

export const fetchCategories = cache(async (): Promise<Category[] | undefined> => {
  try {
    return (await listCategories()).data;
  } catch (error) {
    console.error("fetchCategories failed", error);
    return undefined;
  }
});

/** ProductDetail, null when the product doesn't exist (404), undefined on any other failure. */
export const fetchProduct = cache(async (slug: string): Promise<ProductDetail | null | undefined> => {
  try {
    return (await getProduct(slug)).data;
  } catch (error) {
    if (error instanceof DukaApiError && error.status === 404) return null;
    console.error("fetchProduct failed", error);
    return undefined;
  }
});

export const fetchProductsPage = cache(
  async (categoryId?: string, page = 1): Promise<Paginated<ProductSummary> | undefined> => {
    try {
      const { data } = await listProducts({ page, categoryId });
      // Hidden-category products (Repairs, Watches) are dropped from the rendered
      // items; the API's own total/totalPages aren't recalculated, since it has no
      // concept of these exclusions — an edge case worth knowing about, not fixable
      // from here without backend support for excluding categories server-side.
      return { ...data, items: data.items.filter(isVisibleProduct) };
    } catch (error) {
      console.error("fetchProductsPage failed", error);
      return undefined;
    }
  }
);

/** Every active product, following pagination (pageSize is capped at 100 by the API). */
export async function fetchAllProducts(): Promise<ProductSummary[]> {
  const items: ProductSummary[] = [];
  try {
    for (let page = 1; ; page++) {
      const { data } = await listProducts({ page, pageSize: 100 });
      items.push(...data.items);
      if (!data.hasNextPage) break;
    }
  } catch (error) {
    console.error("fetchAllProducts failed", error);
  }
  return items.filter(isVisibleProduct);
}

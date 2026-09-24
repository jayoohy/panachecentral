import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { railQueryString, type RailConfig } from "@/lib/product-rails";
import type { Paginated, ProductSummary } from "@/lib/duka/types";

/** One homepage rail's products (PRD R6); each rail loads independently (N3). */
export function useProductRail(rail: RailConfig) {
  return useQuery({
    queryKey: ["product-rail", rail.id],
    queryFn: () =>
      apiFetch<Paginated<ProductSummary>>(
        `/api/storefront/products?${railQueryString(rail)}`,
      ),
    select: (page) => page.items,
    staleTime: 5 * 60_000,
  });
}

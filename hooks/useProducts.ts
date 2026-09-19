import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Paginated, ProductSummary } from "@/lib/duka/types";

export type ProductFilters = {
  page?: number;
  categoryId?: string;
  search?: string;
};

export function useProducts(filters: ProductFilters, initialData?: Paginated<ProductSummary>) {
  const query = new URLSearchParams();
  if (filters.page) query.set("page", String(filters.page));
  if (filters.categoryId) query.set("categoryId", filters.categoryId);
  if (filters.search) query.set("search", filters.search);
  const qs = query.toString();

  return useQuery({
    queryKey: ["products", filters],
    queryFn: () =>
      apiFetch<Paginated<ProductSummary>>(`/api/storefront/products${qs ? `?${qs}` : ""}`),
    initialData,
    placeholderData: (previous) => previous, // keeps the grid painted while paging
  });
}

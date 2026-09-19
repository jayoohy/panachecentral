import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { ProductDetail } from "@/lib/duka/types";

export function useProduct(slug: string, initialData?: ProductDetail) {
  return useQuery({
    queryKey: ["product", slug],
    initialData,
    queryFn: () => apiFetch<ProductDetail>(`/api/storefront/products/${encodeURIComponent(slug)}`),
  });
}

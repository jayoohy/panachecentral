import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { ProductDetail } from "@/lib/duka/types";

// slug is nullable so a modal (Quick Look) can mount once and stay idle — no fetch — until
// a product is actually chosen, instead of every card needing its own conditional hook call.
export function useProduct(slug: string | null, initialData?: ProductDetail) {
  return useQuery({
    queryKey: ["product", slug],
    initialData,
    queryFn: () => apiFetch<ProductDetail>(`/api/storefront/products/${encodeURIComponent(slug!)}`),
    enabled: slug !== null,
  });
}

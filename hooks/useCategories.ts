import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Category } from "@/lib/duka/types";

export function useCategories(initialData?: Category[]) {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<Category[]>("/api/storefront/categories"),
    initialData,
    staleTime: 5 * 60_000, // categories change rarely
  });
}

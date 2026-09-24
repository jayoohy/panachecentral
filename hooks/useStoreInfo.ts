import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { PickupLocation, StoreInfo } from "@/lib/duka/types";

export function useStoreInfo() {
  return useQuery({
    queryKey: ["store"],
    queryFn: () => apiFetch<StoreInfo>("/api/storefront/store"),
    staleTime: 5 * 60_000, // merchant settings change rarely
  });
}

/** Only fetched once the shopper picks pickup. */
export function usePickupLocations(enabled: boolean) {
  return useQuery({
    queryKey: ["pickup-locations"],
    queryFn: () =>
      apiFetch<PickupLocation[]>("/api/storefront/pickup-locations"),
    enabled,
    staleTime: 5 * 60_000,
  });
}

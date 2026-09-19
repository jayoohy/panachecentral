"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useCartStore } from "@/lib/store/cart-store";
import type { Customer } from "@/lib/duka/types";

/**
 * Profile query — also the source of truth that reconciles the cached
 * isLoggedIn flag (e.g. an expired session cookie the client didn't know
 * about yet) rather than trusting it blindly forever.
 */
export function useAccount() {
  const isLoggedIn = useCartStore((state) => state.isLoggedIn);
  const setLoggedIn = useCartStore((state) => state.setLoggedIn);

  const query = useQuery({
    queryKey: ["account"],
    queryFn: () => apiFetch<Customer>("/api/storefront/account"),
    enabled: isLoggedIn,
    retry: false,
  });

  useEffect(() => {
    if (query.error instanceof ApiError && query.error.status === 401) {
      setLoggedIn(false);
    }
  }, [query.error, setLoggedIn]);

  return query;
}

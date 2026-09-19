"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Order, OrderSummary, Paginated } from "@/lib/duka/types";

export function useAccountOrders(page: number) {
  return useQuery({
    queryKey: ["account-orders", page],
    queryFn: () => apiFetch<Paginated<OrderSummary>>(`/api/storefront/account/orders?page=${page}`),
  });
}

export function useAccountOrder(orderId: string) {
  return useQuery({
    queryKey: ["account-order", orderId],
    queryFn: () => apiFetch<Order>(`/api/storefront/account/orders/${orderId}`),
    enabled: Boolean(orderId),
  });
}

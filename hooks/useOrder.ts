"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Order } from "@/lib/duka/types";

/**
 * Order confirmation / tracking. Polls every 3s while paymentStatus is
 * "pending" (design spec §3 — "poll briefly rather than treating pending as
 * failure"), stops once it resolves to paid/failed/refunded.
 *
 * `poll: false` (whatsapp checkout mode) skips this entirely — there's no
 * gateway payment to resolve, so the order would sit "pending" forever.
 */
export function useOrder(orderId: string, token?: string, options: { poll?: boolean } = {}) {
  const { poll = true } = options;
  const path = token
    ? `/api/storefront/orders/${orderId}/view?token=${encodeURIComponent(token)}`
    : `/api/storefront/orders/${orderId}`;

  return useQuery({
    queryKey: ["order", orderId, token],
    queryFn: () => apiFetch<Order>(path),
    enabled: Boolean(orderId),
    refetchInterval: (query) => (poll && query.state.data?.paymentStatus === "pending" ? 3000 : false),
  });
}

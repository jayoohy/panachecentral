import "server-only";

import { cookies } from "next/headers";

// docs/storefront-api.md §5.10 is explicit that GET /orders/:id is
// tenant-secret-authenticated only, with NO per-order ownership check on
// Duka's side — it's meant to be called "server-side, with your API secret"
// by code that already knows the caller is entitled to that order. Exposing
// it as a public Route Handler keyed only by the URL's order id would let
// anyone who guesses/enumerates a UUID read another customer's name, email,
// phone, and order contents (an IDOR). This grants a short-lived, narrowly
// scoped claim — set once by our own checkout route right after an order is
// created — so only the browser that just placed that order can read it
// back through the unauthenticated confirmation route.
const COOKIE_NAME = "panache_order_access";
const ONE_HOUR = 60 * 60; // matches Duka's own unpaid-order expiry window (§6)

export async function grantOrderAccess(orderId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, orderId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_HOUR,
  });
}

export async function hasOrderAccess(orderId: string): Promise<boolean> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === orderId;
}

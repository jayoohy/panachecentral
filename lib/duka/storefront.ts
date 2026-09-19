import "server-only";

import { dukaFetch } from "./client";
import type {
  Cart,
  Category,
  CheckoutResponse,
  Customer,
  Order,
  OrderSummary,
  Paginated,
  ProductDetail,
  ProductSummary,
} from "./types";

// One function per docs/storefront-api.md endpoint (§5). Route handlers under
// app/api/storefront/** call these and never touch dukaFetch directly, so
// the auth/cookie plumbing lives in exactly one place.

export function listCategories() {
  return dukaFetch<Category[]>("/catalogue/categories");
}

export function listProducts(params: {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.categoryId) query.set("categoryId", params.categoryId);
  if (params.search) query.set("search", params.search);
  const qs = query.toString();
  return dukaFetch<Paginated<ProductSummary>>(`/catalogue/products${qs ? `?${qs}` : ""}`);
}

export function getProduct(slug: string) {
  return dukaFetch<ProductDetail>(`/catalogue/products/${encodeURIComponent(slug)}`);
}

export function createCart() {
  return dukaFetch<Cart>("/cart", { method: "POST" });
}

export function getCart(cartId: string) {
  return dukaFetch<Cart>(`/cart/${encodeURIComponent(cartId)}`);
}

export function setCartItem(
  cartId: string,
  body: { productVariantId: string; quantity: number }
) {
  return dukaFetch<Cart>(`/cart/${encodeURIComponent(cartId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function applyCoupon(cartId: string, code: string) {
  return dukaFetch<Cart>(`/cart/${encodeURIComponent(cartId)}/coupon`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function removeCoupon(cartId: string) {
  return dukaFetch<Cart>(`/cart/${encodeURIComponent(cartId)}/coupon`, {
    method: "DELETE",
  });
}

export function checkout(
  body: {
    cartId: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    returnUrl?: string;
  },
  sessionCookie?: string
) {
  return dukaFetch<CheckoutResponse>("/checkout", {
    method: "POST",
    body: JSON.stringify(body),
    sessionCookie,
  });
}

export function getOrder(orderId: string) {
  return dukaFetch<Order>(`/orders/${encodeURIComponent(orderId)}`);
}

export function getOrderByToken(orderId: string, token: string) {
  return dukaFetch<Order>(
    `/orders/${encodeURIComponent(orderId)}/view?token=${encodeURIComponent(token)}`
  );
}

export function register(body: {
  email: string;
  password: string;
  name: string;
  phone?: string;
}) {
  return dukaFetch<{ customer: Customer }>("/account/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function login(body: { email: string; password: string }) {
  return dukaFetch<{ customer: Customer }>("/account/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function logout(sessionCookie?: string) {
  return dukaFetch<{ ok: true } | null>("/account/logout", {
    method: "POST",
    sessionCookie,
  });
}

export function forgotPassword(email: string) {
  return dukaFetch<{ message: string }>("/account/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, newPassword: string) {
  return dukaFetch<{ message: string }>("/account/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}

export function getAccount(sessionCookie: string) {
  return dukaFetch<Customer>("/account", { sessionCookie });
}

export function getAccountOrders(
  sessionCookie: string,
  params: { page?: number; pageSize?: number }
) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  const qs = query.toString();
  return dukaFetch<Paginated<OrderSummary>>(`/account/orders${qs ? `?${qs}` : ""}`, {
    sessionCookie,
  });
}

export function getAccountOrder(sessionCookie: string, orderId: string) {
  return dukaFetch<Order>(`/account/orders/${encodeURIComponent(orderId)}`, {
    sessionCookie,
  });
}

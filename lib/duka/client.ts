import "server-only";

// Never import this module (or anything under lib/duka/) from a "use client"
// file or a Client Component — the `server-only` import above makes that a
// build error, but the real guarantee is architectural: only
// app/api/storefront/**/route.ts handlers call into this file.

// DUKA_API_URL already includes the /api/storefront/v1 prefix (see .env.local) —
// paths passed to dukaFetch are relative to that, e.g. "/catalogue/categories".
const BASE_URL = process.env.DUKA_API_URL;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

export class DukaApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "DukaApiError";
    this.status = status;
    this.body = body;
  }
}

function requireEnv() {
  if (!BASE_URL || !API_KEY || !API_SECRET) {
    throw new Error(
      "Duka API is not configured — DUKA_API_URL, API_KEY, and API_SECRET must be set in .env.local"
    );
  }
  return { BASE_URL, API_KEY, API_SECRET };
}

function errorMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const { message } = body as { message: unknown };
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(" ");
  }
  return fallback;
}

/**
 * Thin fetch wrapper around the Duka storefront API. Attaches tenant auth
 * headers, forwards the customer session cookie when present, retries once
 * on 429 per docs/storefront-api.md §3, and normalizes error responses.
 */
export async function dukaFetch<T>(
  path: string,
  init: RequestInit & { sessionCookie?: string } = {}
): Promise<{ data: T; setCookie: string | null }> {
  const { BASE_URL, API_KEY, API_SECRET } = requireEnv();
  const { sessionCookie, ...requestInit } = init;

  const headers = new Headers(requestInit.headers);
  headers.set("X-API-Key", API_KEY);
  headers.set("X-API-Secret", API_SECRET);
  if (requestInit.body) headers.set("Content-Type", "application/json");
  if (sessionCookie) headers.set("Cookie", `duka_customer_session=${sessionCookie}`);

  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    ...requestInit,
    headers,
    cache: "no-store",
  });

  if (response.status === 429) {
    // ponytail: single fixed backoff, not a retry queue — good enough for
    // storefront traffic; add exponential/queue-based retry if 429s show up
    // in practice.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return dukaFetch<T>(path, init);
  }

  const setCookie = response.headers.get("set-cookie");
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new DukaApiError(response.status, errorMessage(body, response.statusText), body);
  }

  return { data: body as T, setCookie };
}

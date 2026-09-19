import "server-only";

import { cookies } from "next/headers";

// Our Next.js server talks to Duka directly (never the browser — see
// docs/storefront-api.md §2.1 and the PRD's secret-isolation requirement),
// so Duka's `Set-Cookie: duka_customer_session=...` lands on our server's
// fetch response, not the shopper's browser. We re-issue it as our own
// first-party cookie (same name, our own attributes) so the browser holds
// it against our domain, then forward its value back to Duka as a `Cookie`
// header on every subsequent authenticated call — see storefront.ts's
// `sessionCookie` param.

const COOKIE_NAME = "duka_customer_session";
const THIRTY_DAYS = 60 * 60 * 24 * 30; // matches the 30-day session lifetime in the API doc

function extractCookieValue(setCookieHeader: string): string | null {
  const match = setCookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? match[1] : null;
}

export async function getSessionCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value;
}

export async function relaySessionCookie(setCookieHeader: string | null) {
  if (!setCookieHeader) return;
  const value = extractCookieValue(setCookieHeader);
  if (!value) return;

  const store = await cookies();
  store.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

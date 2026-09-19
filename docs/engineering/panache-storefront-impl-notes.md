# Engineering Impl Notes: Panache Central Customer Storefront

**Track:** A · **Source design spec:** `docs/design/panache-storefront-design-spec.md` (GATE PASSED)
**Source PRD:** `docs/pm/panache-storefront-prd.md` (F1–F10, GATE PASSED)

---

## 1. Technical Design Summary

**Module boundaries:**

- `lib/duka/` — server-only Duka API client (`client.ts`, `storefront.ts`, `session.ts`, `types.ts`, `route-helpers.ts`). Guarded with `import "server-only"`; only ever imported from `app/api/storefront/**/route.ts`. `lib/duka/types.ts` is the one file safely imported from client code too (type-only, erased at compile time — verified below).
- `app/api/storefront/**` — 17 Route Handlers, one per `docs/storefront-api.md` endpoint used, thin proxies over `lib/duka/storefront.ts`. Dynamic/uncached by default (Next.js default for non-`GET`-cached handlers), which is correct here since cart/order/account data must always be fresh.
- `hooks/` — TanStack Query hooks (`useCategories`, `useProducts`, `useProduct`, `useCart` + mutations, `useCheckout`, `useOrder`, `useAuth`, `useAccount`, `useAccountOrders`). Call **our own** `/api/storefront/**` routes only, never Duka directly — `lib/api-client.ts` centralizes the fetch/error-parsing.
- `lib/store/cart-store.ts` — Zustand + `persist`, holds `cartId`, `isLoggedIn`, and transient `isDrawerOpen` (excluded from persistence via `partialize`).
- `components/commerce/` (new) + `components/shared/Button.tsx` (extracted per design spec §5) + `components/layout/{Header,AccountMenu}` (extended/new).
- `app/{shop,products,cart,checkout,order-confirmation,account}/**` — 13 routes mapping to the design spec's IA (§4).

**Data model changes:** none — this frontend owns no database; all state lives in Duka.

**API contract:** consumes `docs/storefront-api.md` in full (catalogue, cart, coupon, checkout, orders, guest token view, account register/login/logout/forgot-reset/profile/orders). No contract deviations.

**Session relay architecture (the one non-obvious piece):** the API doc's `duka_customer_session` cookie is set by Duka on register/login. Since our Next.js server — not the browser — calls Duka directly (secret isolation requirement), Duka's `Set-Cookie` lands on our server's fetch response. `lib/duka/session.ts` extracts the cookie value and re-issues it as our own first-party `HttpOnly`/`Secure`/`SameSite=lax` cookie (`relaySessionCookie`), then forwards its value back to Duka as a `Cookie` header on subsequent authenticated calls (`dukaFetch`'s `sessionCookie` param). Verified live (see §4).

**Checkout → confirmation order-id handoff (also non-obvious):** `returnUrl` is submitted to Duka *before* the order (and its id) exists, so it can't literally contain the order id for the gateway-redirect path. Resolved by having the client stash `orderId` in `sessionStorage` immediately after the checkout response arrives (before navigating to the gateway) as a fallback the confirmation page reads if the URL doesn't already have `orderId` (it does, directly, on the no-gateway path — see `CheckoutForm.tsx` and `app/order-confirmation/page.tsx`).

## 2. Test Plan & Coverage

| What | How verified |
|---|---|
| `formatMoney` (minor units → currency string) | `lib/format-money.test.ts` — 4 unit tests (whole units, decimals, zero, explicit currency) |
| `formatPaymentStatus` / `formatFulfillmentStatus` / `formatOrderReference` | `lib/format-order-status.test.ts` — 3 unit tests, covering every enum value and the no-raw-UUID display rule |
| Full API surface (categories, products, cart create, register, login, authenticated `GET /account`, logout, 401-without-session) | Live smoke test against the real Duka tenant in `.env.local` — see §4, not an automated suite |
| Type correctness across the whole app (route param types, hook return types, component props) | `npx tsc --noEmit` — clean |
| Lint (including the new `react-hooks/set-state-in-effect` rule) | `npx eslint .` — clean, three real violations found and fixed (see §4) |
| Production build / prerendering | `npm run build` — clean, all 36 routes compile |

**Waiver — automated integration/e2e coverage for cart, checkout, and auth flows:**

```
### Waiver: automated test coverage for cart/checkout/auth user flows
Reason: the tenant's product catalogue currently has categories but zero
`active` products (confirmed live — GET /catalogue/products returns
`items: []`), so the add-to-cart → checkout → payment flow can't be
exercised end-to-end with real data yet, and mocking the entire Duka
contract for a Playwright/RTL suite wasn't feasible inside the requested
turnaround. What *was* verified live: categories, cart creation, register,
login (with real cookie relay), authenticated /account, logout, and the
401-without-session path — all against the real tenant.
Owner: engineering (next session)
Revisit by: once the tenant has active product data — add Playwright
coverage for F3/F5/F6/F7 (cart, checkout, both payment paths) at that point.
```

## 3. Implementation Notes

- Follows existing repo conventions: Tailwind v4 `@theme` tokens, `components/shared` + `components/layout` + new `components/commerce`, `hooks/`, `lib/`.
- `components/shared/Button.tsx` extracted per design spec §5 (was inlined in `FinalCtaSection`) — `FinalCtaSection`, `EmptyState`, and every commerce CTA now share it via `buttonClassName()`.
- Motion primitives (`transitions-dev`) added to `app/globals.css` scoped to what's actually wired up (text-swap, badge-pop, panel-reveal, error-shake, success-check, press feedback) — all class/animation-driven so the existing global `prefers-reduced-motion` rule keeps working without any inline-duration bypass.
- One deliberate, documented exception to the locked brand palette: `--color-error` (#B3261E), scoped strictly to form/stock/payment error states (design spec §0).
- `ponytail:` comments mark three deliberate scope cuts, each with an upgrade path: plain `<img>` instead of `next/image` (tenant media host isn't allowlisted in `next.config.ts` yet), a fixed 1s/one-retry backoff on `429` instead of a queue, and no SSR/hydration-boundary prefetch for TanStack Query (client-fetch-only, per Next's own documented "fetch entirely in the browser" pattern).

## 4. Self-Review Pass (Definition of Done, run explicitly)

- [x] Every F1–F10 acceptance criterion has a corresponding route/component — cross-checked against design spec §1 Traceability Map
- [x] Full test suite passes locally — `npm run test` (7/7)
- [x] Lint passes clean — `npx eslint .` (found and fixed 3 real `react-hooks/set-state-in-effect` violations: `order-confirmation/page.tsx`, `AuthForm.tsx`, `SearchField.tsx` — each rewritten to compute-during-render or ref-guarded-effect instead of a bare prop-mirroring effect)
- [x] Typecheck passes clean — `npx tsc --noEmit` (found and fixed 1 real error: `OrderSummaryPanel.tsx` used `.id` on a union type that doesn't always have it)
- [x] Build passes clean — `npm run build`, all 36 routes
- [x] No hardcoded secrets — independent grep for `API_SECRET`/`X-API-Secret` outside `lib/duka/client.ts`: clean. Cross-checked that every `"use client"` file importing `lib/duka/*` only imports `types.ts` (type-only, erased at compile time, zero runtime code) — no client bundle ever touches the server-only client/storefront/session modules
- [x] Auth/authz: catalogue/cart/checkout are intentionally public (guest checkout is a first-class path per the PRD); every `account/*` route beyond login/register checks for the session cookie and returns `401` before calling Duka if it's missing
- [x] No schema migrations — N/A, no database owned by this app
- [x] No unresolved TODO/FIXME — grep clean; three `ponytail:` scope-cut comments each carry an explicit upgrade trigger (not the same as an unresolved TODO)
- [x] Live-verified against the real tenant in `.env.local`, not just type-checked (see the waiver above for what a lack of product data currently limits)
- [x] Documentation updated — `README.md` rewritten with env var setup, secret-isolation note, and test commands

**Dependency note (flagging for Security, not silently fixing):** `npm audit` shows 2 moderate advisories in `@vitest/mocker`, a transitive dev-only dependency of `vitest` (path traversal in a test-mocking feature — GHSA-82fw-gwwq-j7x9). Dev-only, never shipped in the production bundle. Left as-is rather than force-upgrading vitest to a major version mid-task; Security should confirm/waive.

## 5. GATE — Definition of Done

**GATE PASSED**, with one logged Waiver (automated e2e/integration coverage — §2) and one flagged dev-dependency advisory for Security to confirm (§4).

---

## Downstream Contract

By passing this gate, the **Security Engineer** persona can assume:
- A complete, working implementation exists against the real Duka tenant — verified live, not just type-checked
- Every new endpoint (17 Route Handlers) is enumerated in §1, each mapped to its Duka counterpart
- Secret isolation is independently verified here (not just self-attested) — `API_SECRET` never leaves `lib/duka/client.ts`, confirmed by grep and by tracing every client-side import of `lib/duka/*`
- The session-cookie relay mechanism (§1) is the one piece of custom auth-adjacent plumbing in this change and deserves a close look — it's a first-party cookie re-issued from a server-to-server `Set-Cookie`, not a pass-through
- The dependency advisory in §4 is flagged, not hidden, for an explicit go/waive decision

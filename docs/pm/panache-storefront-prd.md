# PRD: Panache Central Customer Storefront

**Track:** A (new customer-facing capability, new third-party integration, multi-system)
**Status:** Draft → Gate check below
**Owner:** Solo engineer (Panache Central)
**Date:** 2026-09-18

---

## 1. Problem Statement & Opportunity

Panache Central currently has a marketing/brochure site (`app/about`, `app/contact`, `app/care-materials`, etc.) with **no commerce functionality** — a visitor cannot browse products, add to cart, or purchase anything on the site today. The backend commerce platform (Duka) already exists and exposes a documented public storefront API (`docs/storefront-api.md`) covering catalogue, cart, checkout, payments, and optional customer accounts. Nothing on the frontend consumes it yet.

Without a storefront, there's no self-serve online sales channel — every sale currently requires an out-of-band process (DM, WhatsApp, in-person). This is the opportunity: turn the existing marketing site into a functioning e-commerce storefront using the already-built Duka API.

## 2. Goals & Success Metrics

**Primary metric:** Launch readiness — a fully functional storefront (browse → product detail → cart → checkout → payment redirect where applicable → order confirmation → account/order history) deployed and passing all SDLC gates.

- **Baseline:** 0% — no commerce capability exists today.
- **Target:** 100% of the flow above functional against the live Duka tenant (credentials already provisioned in `.env.local`), gated through Security review, by **2026-09-25**.

This is a launch-readiness metric, not a conversion/GMV metric, because there is no existing storefront traffic to baseline a conversion number against. Post-launch conversion/order-volume targets become the input to the **next** PM cycle (see Growth Manager's closing-the-loop responsibility) once real traffic data exists.

## 3. Scope

### In-Scope
- Product catalogue browsing: category list/nav, product grid with pagination + search + category filter (§5.1, §5.2 of the API doc)
- Product detail page: images, variants (size/color/etc.), price, stock-aware add-to-cart (§5.3)
- Cart: create/get/update line items, persisted client-side across visits (§5.4–5.6)
- Coupon apply/remove on cart (§5.7–5.8)
- Checkout: guest or logged-in, optional payment gateway redirect, both response shapes handled (§5.9, §6)
- Order confirmation page: server-side order fetch, or token-based guest link from the confirmation email (§5.10–5.11)
- Customer accounts: register, login, logout, forgot/reset password, profile, order history (§5.12–5.16)
- All API secret usage server-side only (Next.js Route Handlers / Server Actions) — secret never reaches the browser, per the API doc's explicit requirement
- Responsive layout (mobile/tablet/desktop) — Panache is a fashion/apparel brand, expect majority mobile traffic

### Out-of-Scope
- Anything under the admin dashboard's API surface (`/catalogue/*` admin routes, `/staff`, `/platform/*`) — explicitly out of scope per the API doc itself
- Building or modifying the Duka backend/API
- Payment gateway *configuration* (merchant connects Paystack/Flutterwave/Opay in the Duka admin dashboard, not this storefront)
- Multi-tenant/multi-store switching — this deployment serves exactly one tenant
- Wishlists, product reviews/ratings, gift cards, subscriptions — not present in the documented API surface
- Native mobile app / PWA install experience
- "Look up my order by email" fallback beyond the 90-day guest token link (doc explicitly notes this requires an account — out of scope for v1)
- Multi-currency switching beyond displaying the tenant's configured `currency` field

## 4. Requirements

### Functional (user stories)

| # | Story | Acceptance Criterion |
|---|---|---|
| F1 | As a shopper, I want to browse products by category and search, so I can find what I'm looking for | Grid loads via `GET /catalogue/products` with working `page`/`search`/`categoryId` params; category nav from `GET /catalogue/categories` |
| F2 | As a shopper, I want to view a product's variants, price, and stock, so I can decide what to buy | Detail page renders all variants from `GET /catalogue/products/:slug`; out-of-stock variants (`stock: 0`) are disabled for add-to-cart |
| F3 | As a shopper, I want to add/update/remove items in my cart and have it persist across visits, so I don't lose my selection | Cart id persisted in `localStorage`; `PATCH /cart/:id` reflects as an absolute quantity, not a delta; cart survives a page reload |
| F4 | As a shopper, I want to apply a coupon code and see the discount reflected, so I can use promotions | `POST /cart/:id/coupon` updates `discountMinorUnits`/`totalMinorUnits`; invalid/expired codes show the API's specific error message |
| F5 | As a shopper, I want to check out as a guest or logged-in customer, so I can complete a purchase without being forced to register | `POST /checkout` succeeds both with and without a session cookie present; cart id is invalidated after checkout |
| F6 | As a shopper paying via a connected gateway, I want to be redirected to pay and land back on a confirmation page, so I know my order went through | On `payment.redirectUrl` present, full browser redirect occurs; `returnUrl` always includes the order id; confirmation page polls `paymentStatus` briefly rather than treating `pending` as failure |
| F7 | As a shopper checking out with no gateway configured, I want checkout to complete without any payment redirect, so the flow isn't blocked by a feature the tenant doesn't use | `payment` key absent → go straight to confirmation route, no dead-end UI |
| F8 | As a shopper, I want an order confirmation/tracking page, so I can see what I bought and its status | Renders `items`, totals, `paymentStatus`, fulfillment `status` from `GET /orders/:id` (server-side) or the emailed guest token link |
| F9 | As a returning customer, I want to register/log in and see my order history, so I don't have to re-enter my details every time | `account/register`, `account/login`, `account/orders`, `account/orders/:id` all function; session cookie gates `account/*` routes client-side (redirect to login if 401) |
| F10 | As a customer who forgot my password, I want to reset it via email, so I can regain access | `forgot-password` → generic response always; `reset-password` consumes the token exactly once |

### Non-Functional
- **Security:** `X-API-Secret` never present in any client-side bundle or browser request — all Duka API calls proxied through this app's own server (Route Handlers/Server Actions). Verified independently at the Security stage, not just self-attested here.
- **Resilience:** `429` responses trigger retry/backoff, not a hard failure, per the API doc's rate-limit guidance.
- **Accessibility:** WCAG 2.1 AA baseline (contrast, focus order, screen-reader labels, 44×44pt touch targets) — detailed further at the Design stage.
- **Performance:** product listing and detail pages should feel instant on repeat navigation — server-side caching/revalidation on catalogue reads (catalogue changes infrequently relative to cart/order state).
- **Correctness under drift:** cart totals are a *preview* — checkout is the source of truth for final pricing/tax (doc explicitly warns the total can shift slightly at checkout); UI must not promise a locked-in total before checkout completes.

## 5. Constraints & Assumptions

- **Stack:** Next.js 16 (App Router) + React 19, already in the repo. TanStack Query + Zustand already installed for server-state caching and small persisted client state (cart id, cached login flag) — see prior conversation turn.
- **Credentials:** Live Duka tenant credentials already provisioned in `.env.local` (`DUKA_API_URL`, `API_KEY`, `API_SECRET`) — not committed to git, used server-side only.
- **Tenant resolution:** Local/this deployment uses the API-key-only resolution method (§1 of the API doc) — no Host header spoofing needed.
- **Single tenant:** This storefront serves exactly one Duka tenant; no tenant-switching UI.
- **Payment gateway is opaque:** whether the tenant has Paystack/Flutterwave/Opay connected is unknown to this app and must not be assumed either way — both response shapes from checkout must be handled identically well.
- **No "am I logged in" cheap check:** the only way to know is calling `GET /account` and checking for `401` — this needs to be cached client-side per the doc's own guidance, not called on every render.

## 6. Risks

| Risk | Mitigation |
|---|---|
| Secret (`API_SECRET`) accidentally leaks into a client component/bundle | All Duka calls isolated to a single server-only module (`lib/duka/client.ts` or similar); Security stage independently greps the diff, not just trusts this note |
| Cart `PATCH` doesn't enforce stock — overselling possible until checkout | Use product-detail `stock` as a soft client-side cap on quantity selectors; handle checkout-time stock-conflict errors with clear, specific UI messaging (not a generic failure) |
| Coupon can silently go invalid between reads (someone else exhausts the redemption limit) | Always re-render cart totals from the latest API response; surface a visible "coupon removed" notice if `couponCode` flips to `null` unexpectedly |
| Aggressive timeline (2026-09-25, ~1 week) for full scope including accounts | MoSCoW below sequences the core commerce path (browse→cart→checkout→confirmation) as Must #1; if time runs short, accounts (F9–F10) are the most defensible item to slip to a fast-follow, but user has explicitly requested them in v1 — flagged, not silently descoped |
| Payment confirmation is webhook-driven with a delay window; a naive confirmation page could show "payment failed" prematurely | Confirmation page must poll briefly on `pending` rather than treat it as terminal failure, per §6 of the API doc |
| Solo-operator SDLC has no second reviewer | Security stage independently re-verifies rather than trusting Engineering's self-report, per the existing `.claude/rules/security-engineer.md` process already in place for this workspace |

No infrastructure/DNS/CDN changes are part of this feature — deployment target/hosting is unchanged from the existing Next.js app, so the historical infra-incident checklist items in the Security stage are expected to be low-touch here (still checked, not skipped).

## 7. Prioritization (MoSCoW)

- **Must:** F1, F2, F3, F5, F6, F7, F8 (core commerce path: browse → detail → cart → checkout → both payment paths → confirmation), plus the non-functional secret-isolation requirement
- **Must:** F9, F10 (accounts) — explicitly requested for v1 by the user, elevated from the usual "fast-follow" default
- **Should:** F4 (coupons) — valuable but not load-bearing for a first sale to go through
- **Could:** Search-as-you-type debounce polish, richer empty/loading states beyond the Design stage's minimum spec
- **Won't (this cycle):** Everything in Out-of-Scope above

## 8. Acceptance Criteria

Captured per-requirement in the Functional Requirements table (§4) above — each is independently testable by the Software Engineer and Security personas without needing to ask the PM what was meant.

Additional cross-cutting acceptance criteria:
- A fresh `git grep` for `API_SECRET` outside of server-only files returns nothing.
- Loading the storefront with `localStorage` cleared creates exactly one new cart (`POST /cart` called once, not on every render).
- Every page in the Must scope renders a working state with the real tenant data in `.env.local` before handoff to Security.

## 9. Definition of Ready — Gate Check

- [x] Problem statement is specific and falsifiable — "no commerce capability exists" is checkable against the current repo (confirmed: only marketing pages exist)
- [x] Success metric is quantified with baseline (0%) and target (100% of defined flow, live-tenant-verified, by 2026-09-25)
- [x] Scope has explicit Out-of-Scope items, not just In-Scope
- [x] Every requirement (F1–F10) has at least one acceptance criterion
- [x] Requirements are prioritized — not everything is an undifferentiated Must; Should/Could/Won't are populated
- [x] Risks section is non-empty with mitigations
- [x] No placeholder text (`[TBD]`, `TODO`, `???`) remains
- [x] File committed at `docs/pm/panache-storefront-prd.md`

**GATE PASSED.**

---

## Downstream Contract

By passing this gate, the **UI/UX Designer** persona can assume:
- Scope is locked: the 10 functional requirements (F1–F10) above, nothing more, nothing less, for this cycle
- Target user is a Panache Central shopper (assume primarily mobile), browsing a fashion/apparel catalogue
- Every screen the Designer specs must trace back to F1–F10
- No success metric ambiguity to resolve later — it's launch-readiness by 2026-09-25, not a conversion number

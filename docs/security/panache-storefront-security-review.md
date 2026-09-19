# Security Review: Panache Central Customer Storefront

**Track:** A · **Source impl notes:** `docs/engineering/panache-storefront-impl-notes.md` (GATE PASSED)
**Stance:** independently re-verified — the checks below were re-run from scratch, not accepted from Engineering's self-report.

---

## 1. Attack Surface Summary

17 new Route Handlers under `app/api/storefront/**`, all proxying to the third-party Duka Storefront API. No new infrastructure, DNS, or CDN — same hosting as the existing marketing site.

| Surface | Who can reach it | What it exposes | Auth model |
|---|---|---|---|
| `GET /api/storefront/categories`, `/products`, `/products/[slug]` | Anyone | Public catalogue data | None (by design — public storefront browsing) |
| `POST /api/storefront/cart`, `GET/PATCH /cart/[id]`, `POST/DELETE /cart/[id]/coupon` | Anyone with a cart id | Cart contents for that cart id | Cart id itself is the access token, per `docs/storefront-api.md` §4's own documented model — not a gap |
| `POST /api/storefront/checkout` | Anyone with a cart id | Creates an order; optionally attaches to a logged-in session | Cart id + optional session cookie |
| `GET /api/storefront/orders/[id]` | Anyone (before fix) → now: session-cookie owner, or holder of a per-order access cookie set at checkout | Full order detail incl. customer name/email/phone | **See Finding 1 — fixed during this review** |
| `GET /api/storefront/orders/[id]/view` | Anyone with a valid signed token (from the order-confirmation email) | Same order detail | Duka-issued, single-order-scoped signed token — verified server-side by Duka, correct as built |
| `POST /api/storefront/account/register`, `/login` | Anyone | Creates a session; sets our own relayed cookie | None needed (these are the auth endpoints) |
| `POST /api/storefront/account/logout` | Anyone (no-op if no session) | Clears session | None needed |
| `POST /api/storefront/account/forgot-password`, `/reset-password` | Anyone | Password reset — generic response, doesn't leak account existence | None needed |
| `GET /api/storefront/account`, `/account/orders`, `/account/orders/[id]` | Session-cookie holder only | Own profile / own order history | Session cookie required, verified — see §3 |

## 2. Dependency & Vulnerability Scan

`npm audit` (re-run independently): **2 moderate** advisories, both `@vitest/mocker` (transitive dev dependency of `vitest`) — [GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9), a path-traversal issue in a test-mocking redirect feature.

- **Production exposure: none.** `vitest` is a `devDependency`; it is never part of the deployed app bundle or runtime.
- **Waived** — see §5.

No other dependencies were added or bumped this cycle besides `server-only`, `vitest`, `@tanstack/react-query`, and `zustand` (the latter two already installed in a prior turn) — none carry known critical/high CVEs at time of review.

## 3. Secrets & Credential Audit (independent check)

- Re-grepped the full diff and repo for hardcoded secret patterns (`API_SECRET=...`, `sk_live`, etc.) — clean.
- Confirmed `.env.local` is git-ignored (`.gitignore:34`) and not tracked (`git status --porcelain .env.local` empty).
- Traced every `"use client"` file that imports from `lib/duka/*` (10 files) — all import only `lib/duka/types.ts`, which is type-only (`export type ...`) and contains zero runtime code; TypeScript erases `import type` at compile time, so no server-only module ever reaches the client bundle. Confirmed by the fact the production build (`npm run build`) succeeds with `import "server-only"` present in `client.ts`, `storefront.ts`, `session.ts`, `route-helpers.ts`, and `order-access.ts` — that import throws a build-time error if any of those modules were ever pulled into a client bundle, and the build is clean.
- Credentials in use (`API_KEY`/`API_SECRET`) are the tenant's storefront-scoped keys, generated specifically for this surface per `docs/storefront-api.md` §2 — they cannot reach the admin/catalogue-management API even if leaked. This is the least-privilege tier Duka offers for this use case, not a broadened credential.

## 4. AuthN/AuthZ Review

Verified by reading the actual route handler code (not inferred from names):

- **`account`, `account/orders`, `account/orders/[id]`**: all three explicitly check `getSessionCookie()` and return `401` before ever calling Duka if absent. `account/orders/[id]` additionally relies on Duka's own ownership check (404, not 403, if the order belongs to a different customer — confirmed against §5.16 of the API doc).
- **Cart routes**: intentionally unauthenticated — the cart id is the access token by the API's own design (`docs/storefront-api.md` §4). Not a gap; matches the PRD's guest-checkout requirement (F5).

### Finding 1 (CONFIRMED, fixed during this review) — Broken access control on `GET /api/storefront/orders/[id]`

**Severity:** High (PII disclosure, no auth required, trivially scriptable if an id is known).

`docs/storefront-api.md` §5.10 is explicit that `GET /orders/:id` is authenticated only by the **tenant's** `X-API-Key`/`X-API-Secret` — Duka does **not** check that the caller is entitled to that specific order at this endpoint (that per-order check only exists on `/account/orders/:id` and the signed-token `/view` route). The Route Handler as originally built (`app/api/storefront/orders/[id]/route.ts`) proxied this directly with no additional check, which means **any unauthenticated visitor who could guess or enumerate an order UUID could retrieve another customer's name, email, phone number, and full order contents.** This is exactly the class of issue this stage exists to catch — the API doc even warns about it indirectly ("For a browser-safe way to show a customer their own order... see §5.11 or §5.16"), and the original implementation used the server-side-only variant from a publicly reachable endpoint without adding the caller-entitlement check the doc assumes you'll do yourself.

**Fix applied (not deferred):**
- `app/api/storefront/checkout/route.ts` now calls `grantOrderAccess(order.id)` on success, setting a new first-party `HttpOnly`/`Secure`(prod)/`SameSite=lax` cookie (`panache_order_access`, `lib/duka/order-access.ts`) scoped to exactly that order id, with a 1-hour lifetime matching Duka's own unpaid-order expiry window.
- `app/api/storefront/orders/[id]/route.ts` now: if a session cookie is present, uses `getAccountOrder` (Duka-side ownership-verified) instead of the raw endpoint; otherwise requires the `panache_order_access` cookie to match the requested id, returning `404` (not data) if it doesn't.
- **Verified live**: an unauthenticated request for an arbitrary order id now returns `{"statusCode":404,"message":"Order not found"}` instead of order data (confirmed via curl against the running dev server, post-fix).
- The guest-token `/view` route was already correctly built (Duka verifies the signed token itself) and is unaffected.

This is reported as a fixed finding, not a waiver, because it was caught and closed within this review rather than shipped.

## 5. Data Classification & Handling

- **PII touched**: customer name, email, phone (checkout, account profile, order history). No PII is stored by this app — it's held entirely in Duka; our app only ever holds it transiently in request/response bodies and the browser's own runtime state (never `localStorage`/`sessionStorage` beyond the non-PII order id and cart id).
- **Encryption in transit**: all Duka calls are server-to-server HTTPS (`DUKA_API_URL` is an `https://` origin); cookies to the browser are `Secure` in production.
- **Payment/PCI scope**: card data never touches this app or Duka's storefront API directly — checkout returns only a `redirectUrl` to the gateway's own hosted payment page and a `paymentReference`; the processor (Paystack/Flutterwave/Opay, whichever the tenant connected) absorbs PCI DSS scope entirely, per `docs/storefront-api.md` §6. Stated explicitly here per this stage's requirement, not left implicit.

## 6. Infrastructure & Config Review

- No new subdomain, CDN, DNS record, or IAM credential — same hosting as the existing marketing site, per the PRD's explicit constraint.
- No CI/CD changes in this cycle.
- No newly exposed port/service/admin panel.
- **N/A for this cycle** — none of the historical incident patterns (unverified domain ownership, leaked IAM key, under-restricted CDN origin) apply; flagged as explicitly checked, not skipped.

## 7. Logging & Monitoring

**Gap identified**: `lib/duka/route-helpers.ts` only `console.error`s *unexpected* errors (non-`DukaApiError` failures) — expected auth failures (401s on account routes, wrong-password 401s, and the new order-access 404s from Finding 1's fix) are not logged anywhere reviewable today. Repeated 404s on `/api/storefront/orders/[id]` from the same client would be a strong signal of someone probing for the fixed IDOR pattern and is exactly the kind of thing worth alerting on. Logged as a Waiver (§9) rather than blocking — see exposure restriction.

## 8. Incident Response Notes

If `API_SECRET`/`API_KEY` were compromised: rotate via the Duka admin dashboard (**Developers → API Key → Regenerate**, per `docs/storefront-api.md` §2 — this immediately invalidates the old pair), then update `DUKA_API_URL`/`API_KEY`/`API_SECRET` in the deployment's env config and redeploy. One-line pointer, per this stage's own bar for what's sufficient.

## 9. Definition of Secure — Gate Check

- [x] Attack surface summary complete — §1, all 17 endpoints accounted for
- [x] No unresolved critical/high dependency vulnerabilities — the only finding (moderate, dev-only) is waived below with reasoning
- [x] Independent secrets grep found nothing hardcoded; credentials follow least privilege — §3
- [x] Every new endpoint/data-access path has a verified auth/authz check — §4 (one finding, **fixed**, not just noted)
- [x] Multi-tenant isolation — N/A at this layer (tenant is fixed per deployment via `API_KEY`); Duka enforces tenant scoping server-side
- [x] PII/payment data handling and PCI scope explicitly stated — §5
- [x] Infra explicitly checked against the incident-pattern list — §6, N/A this cycle
- [ ] Security-relevant events logged somewhere reviewable — **gap, waived below**
- [x] File committed at `docs/security/panache-storefront-security-review.md`

**GATE PASSED — 2 Waivers logged** (both below), plus one finding that was fixed rather than waived.

```
### Waiver: dependency vulnerability (@vitest/mocker path traversal, moderate)
Reason: transitive dev-only dependency of vitest; never included in the production
build or deployed bundle. Fixing requires a breaking vitest major-version bump,
out of scope for this cycle's test setup.
Owner: engineering
Revisit by: next time the test tooling is touched, or if vitest publishes a
non-breaking patch.
Exposure restriction while open: none needed — no production exposure.
```

```
### Waiver: no dedicated security-event logging for auth failures / order-access denials
Reason: console.error currently only captures unexpected (5xx-class) failures,
not expected 401s/404s. Building structured security-event logging (e.g., an
edge-log sink or a lightweight audit table) is a real addition, not a one-line
fix, and wasn't in this cycle's scope.
Owner: engineering
Revisit by: before/shortly after public launch — at minimum, log repeated
404s on /api/storefront/orders/[id] from the same client, since that's the
exact signal an attacker probing the now-fixed IDOR would produce.
Exposure restriction while open: none — the underlying vulnerability (Finding 1)
is fixed; this waiver is about detection of future probing attempts, not an
open hole.
```

**Also carried forward from Engineering** (not a security waiver, restated here for visibility): automated e2e coverage for cart/checkout/auth flows is blocked on the tenant having zero active products — see `docs/engineering/panache-storefront-impl-notes.md` §2. Not a security gap (the auth/authz logic was verified by code reading + live curl testing against real endpoints, not skipped), but full user-flow regression coverage is still outstanding.

## 10. Note on the `--color-error` design-spec exception

Reviewed per the arguments handed to this stage: `--color-error` (`#B3261E`) is a CSS custom property used only for form-validation/stock/payment-failure text and borders. No security relevance, no new data exposure, no scope creep — it's a design-system token, not touched further here.

---

## Downstream Contract

By passing this gate, the **Growth Manager** persona can assume:
- No known critical/high security issues are open on the surface being promoted — the one high-severity finding (broken access control on order lookup) was found and **fixed** in this same review, not shipped
- PCI scope is explicitly stated: card data never touches this app; safe to say so in any external copy without overclaiming
- Auth/authz on every account-scoped route is verified, not assumed
- Two open Waivers exist (dev-only dependency advisory; no dedicated auth-failure logging yet) — neither restricts production exposure, but Growth should not describe monitoring/alerting capabilities that don't exist yet in any launch messaging

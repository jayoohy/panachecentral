# Security Review: Storefront API Readiness

**Track:** A · **Impl notes:** `docs/engineering/storefront-api-readiness-impl-notes.md` · **Date:** 2026-09-24

## 1. Attack Surface
| Surface | Reachable by | Exposes / accepts |
|---|---|---|
| `GET /api/storefront/store` | Anyone | Store name, logo, currency, delivery/pickup settings, contact. All already public on the storefront. |
| `GET /api/storefront/pickup-locations` | Anyone | Location name/address/phone the merchant chose to publish for pickup. |
| `POST /api/storefront/checkout` (changed) | Anyone with a cart id | Now accepts address PII (name, phone, street, city, state, landmark). Body is allowlisted before reaching Duka. |
| `GET /api/storefront/products` (changed) | Anyone | `sort` allowlisted; `featured` boolean. Same public catalogue data. |
| Order confirmation / account order pages | Existing order-access cookie / session (unchanged) | Now render the delivery address or pickup location of that order. |

Missed by Engineering: none found. One gap found and closed during review: before this change the checkout proxy forwarded the raw browser body. That would have let a client pass `savedAddressId` for any id. Duka scopes saved addresses to the session customer (§5.21), so the realistic impact was low, but the allowlist now removes the question entirely.

## 2. Dependency Scan
`npm audit --omit=dev`: 0 vulnerabilities. Full `npm audit`: 2 moderate (dev-only `@vitest/mocker`), already waived in `panache-storefront-security-review.md`. No dependencies changed.

## 3. Secrets & Credentials (independent)
Grepped the diff and all new files for key/secret/token/password assignments: no matches. Duka key/secret still read only in `lib/duka/client.ts` (`server-only`). No new credentials or scopes.

## 4. AuthN / AuthZ
- New GETs are intentionally public (same data as the storefront pages). Rate limiting is Duka's per-tenant limit (§3).
- Checkout: the session cookie is still attached server-side only; the browser can't choose whose account the order attaches to.
- Order views showing the address reuse the existing access controls (order-access cookie from `lib/duka/order-access.ts`; account routes require the customer session). No new read path to order data was added.
- Multi-tenant: single-tenant storefront; tenant fixed by server credentials.

## 5. Data Classification
- New PII collected: delivery recipient name, phone, street address, city, state, landmark. Sent over TLS to Duka; not stored by this app (no DB, not in localStorage). Rendered back only to the order's own viewer.
- Payment: unchanged. WhatsApp mode or gateway redirect; card data never touches our servers; PCI scope stays with the gateway.
- Privacy page: `/privacy` (draft) already covers delivery details for fulfilment. Confirm the final legal copy mentions delivery addresses.

## 6. Infrastructure
No new subdomain, DNS, CDN, IAM or CI change. Product images continue to load from the tenant's existing S3 host (unchanged).

## 7. Logging & Monitoring
Checkout validation failures are returned to the shopper and not logged, the same as before. The existing Waiver on security-event logging (`panache-storefront-security-review.md`) still applies; no new admin capability.

## 8. Incident Response
No credentials involved. Rollback = revert the commit; checkout would then fail against the live API again (it already requires `fulfilmentMethod`), so roll forward rather than back unless the release itself is faulty.

## 9. Definition of Secure
- [x] Attack surface complete
- [x] No unresolved critical/high dependency vulnerabilities
- [x] Independent secrets grep clean; no new credentials
- [x] New paths' auth verified (public-by-design GETs; existing controls on order views)
- [x] Multi-tenant isolation: N/A (single tenant, server-fixed)
- [x] PII/payment handling stated
- [x] No new infra
- [x] Logging: unchanged; existing Waiver carries over
- [ ] Committed: pending the owner's commit

**GATE PASSED**: no new Waivers; no exposure restriction needed.

# Implementation Notes: Storefront API Readiness

**Track:** A · **PRD:** `docs/pm/storefront-api-readiness-prd.md` · **Design:** `docs/design/storefront-api-readiness-design-spec.md` · **Date:** 2026-09-24

## 1. Technical Design Summary

### New endpoints (our Next.js proxy → Duka, server-side secrets as before)
| Route | Method | Duka call | Auth | PRD |
|---|---|---|---|---|
| `/api/storefront/store` | GET | `GET /store` (§5.17) | Tenant key/secret (server) · public data | R1, R4 |
| `/api/storefront/pickup-locations` | GET | `GET /pickup-locations` (§5.18) | Tenant key/secret (server) · public data | R3 |

### Changed endpoints
| Route | Change | PRD |
|---|---|---|
| `POST /api/storefront/checkout` | Body now passes through `pickCheckoutRequest` (allowlist: cart, contact, returnUrl, `fulfilmentMethod`, `deliveryAddress` fields, `pickupLocationId`). Previously the raw browser JSON was forwarded to Duka. | R1–R3, N1 |
| `GET /api/storefront/products` | Forwards `sort` (allowlisted by `parseProductSort`) and `featured=true`. | R6 |

No data model/schema changes (this app has no database).

### Modules
- `lib/checkout.ts`: pure helpers: `pickCheckoutRequest`, `availableMethods`, `deliveryCharge`.
- `lib/nigerian-states.ts`: 36 states + FCT.
- `lib/product-rails.ts`: rail config, `parseProductSort`, `railQueryString`.
- `lib/duka/types.ts`: `StoreInfo`, `PickupLocation`, `DeliveryAddress`, `CheckoutRequest`, `ProductSort`; `Order` gains fulfilment/courier fields; `ProductSummary.images` (hover ticket).
- `lib/duka/storefront.ts`: `getStore`, `listPickupLocations`; `listProducts` takes `sort`/`featured`; `checkout` typed by `CheckoutRequest`.
- Hooks: `useStoreInfo`/`usePickupLocations`, `useCheckoutFulfilment` (page-owned choice state, preselects a lone option), `useProductRail`, `useRailScroll` (edge state + page-by-viewport, reduced-motion aware).
- Components: `FulfilmentSection`, `RadioCard`, `DeliveryAddressFields`, `PickupLocationList`, `CheckoutField` (extracted from `CheckoutForm`'s inline `Field`), `FulfilmentDetails`, `ProductRail` (+ skeleton), `RailControls`, `home/ProductRailSection`. `OrderSummaryPanel` gains a delivery row; `Section` gains `labelledBy`.
- Design-spec deviation: the spec's `FulfilmentChoice` became a generic `RadioCard` shared by the method choice and the pickup list (same markup, one component instead of two).

## 2. Test Plan & Coverage
| Criterion | Verification |
|---|---|
| N1 allowlist; R2/R3 request shape | `lib/checkout.test.ts` (unknown fields dropped, pickup has no address, bad method dropped, non-object body) |
| R1 methods offered | `lib/checkout.test.ts` `availableMethods` (4 combinations) |
| R4 fee / free / note / pickup | `lib/checkout.test.ts` `deliveryCharge` |
| R2 state list = 37 | `lib/checkout.test.ts` |
| R6 rail queries; sort allowlist | `lib/product-rails.test.ts` |
| Live API contract | Manual against the live tenant, 2026-09-24: `/store` and `/pickup-locations` proxy OK; checkout without fulfilment → `400 "Choose delivery or pickup."` (confirms the break); pickup while disabled → store's message; bad state / missing city → field messages (new shape reaches Duka's field validation). All against a throwaway cart; no order created. |
| R6/R7, design §9 | Headless Chrome: rails render (Featured hidden, as the tenant has no featured products), prev disabled at start, checkout renders Delivery-only preselected with note-mode copy (desktop + 390px). |

### Waiver: automated UI tests for R1/R5/R6 component behaviour
Reason: Vitest runs in a node environment with no DOM/component testing library; adding one is a dependency + config change outside this PRD. Logic is extracted into tested pure modules; UI verified manually in headless Chrome.
Owner: Onyedika Anagha
Revisit by: Next cycle that touches checkout UI (add `@testing-library/react` + jsdom).

### Waiver: end-to-end order placement
Reason: Placing a successful order creates a real order on the live tenant. Validation paths were exercised; the success path was not.
Owner: Onyedika Anagha
Revisit by: Before deploy. Place one real delivery order and cancel it in the admin.

## 3. Implementation / Self-Review
Re-read the full diff. Findings fixed during self-review:
- Rail "previous" button was never disabled: scroll-snap settled 4px in because of the focus-ring padding. Fixed with `scroll-px-1` + an 8px edge tolerance.
- Fieldset border rendered through the legend: moved to a wrapper.
- An accidental repo-wide Prettier pass reformatted ~30 untouched files; reverted, and intended edits re-applied so the diff only carries real changes.
- Found and fixed a pre-existing bug: a new cart was created on every full page load. Tracked separately: `docs/pm/tickets/cart-lost-on-reload.md`.

No TODO/FIXME added.

## 4. Documentation
This file, the PRD, the design spec, the security review and the launch plan. `docs/storefront-api.md` is the upstream API reference (unchanged by this work). No README/CHANGELOG exists in this repo beyond the docs tree.

## 5. Baseline Security Hygiene
- No secrets added; all Duka calls stay in `lib/duka/*` (server-only).
- Input at the trust boundary: checkout body allowlisted; `sort` allowlisted; `featured` only ever forwarded as `true`.
- New GET routes are intentionally public (they return what any shopper sees on the storefront).
- No dependencies added.

## Definition of Done
- [x] Every acceptance criterion implemented; logic criteria have passing tests, UI criteria verified manually (Waiver above)
- [ ] Full suite passes: 19/20. The failing `lib/format-order-status.test.ts` ("Payment Confirmed" vs "Confirmed") fails on `main` before this work and is untouched here.
- [x] `tsc`, ESLint, `next build` clean
- [x] No hardcoded secrets (grep run)
- [x] New endpoints: public-by-design, noted above
- [x] No migrations
- [x] No unlinked TODO/FIXME
- [ ] Committed: pending the owner's commit
- [x] Docs reflect the change

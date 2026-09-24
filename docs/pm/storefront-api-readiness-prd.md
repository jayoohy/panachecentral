# PRD: Storefront API Readiness — Checkout Fulfilment & Product Rails

**Track:** A · **Date:** 2026-09-24 · **Owner:** Onyedika Anagha
**Trigger:** Duka's "2026-09 storefront readiness" API release (`docs/storefront-api.md` → Changelog), reviewed 2026-09-24.

## 1. Problem Statement & Opportunity

1. **Checkout breaks on the new API.** `POST /checkout` now requires
   `fulfilmentMethod` (`delivery` | `pickup`) plus an address or pickup
   location (§5.9). Our checkout sends neither, so every order attempt fails
   with `400 "Choose delivery or pickup."` once the API is deployed. Shoppers
   also can't see the delivery fee before they commit, and the order
   confirmation doesn't say where the order is going.
2. **The homepage doesn't show any products.** It shows category tiles only.
   A shopper who wants "what's new" or "what people buy" has to click into
   /shop and browse an alphabetical grid. The API now offers `sort=newest`,
   `sort=best_selling` and `featured=true` (§5.2), so these lists can be
   built without backend work.

Falsifiable: (1) is false if the live API accepts a checkout without
`fulfilmentMethod`; (2) is false if the homepage already renders product tiles.

## 2. Goals & Success Metrics

| # | Metric | Baseline | Target | How measured |
|---|---|---|---|---|
| M1 | Storefront orders that carry a `fulfilmentMethod` | 0% (field never sent) | 100% of storefront orders placed after deploy | Duka admin order list (`fulfilmentMethod` column / `list_orders`) |
| M2 | Checkout attempts rejected with `"Choose delivery or pickup."` | 100% once the API is deployed | 0 | Manual checkout on the live tenant; route error logs |
| M3 | Home → product-page click-through from rails | Not measurable (no analytics) | — | See Waiver below |

### Waiver: Quantified metric for the product rails (M3)
Reason: The storefront has no analytics instrumentation (see `docs/growth/panache-storefront-launch-plan.md` §7). We can't baseline or measure rail click-through.
Owner: Onyedika Anagha
Revisit by: The analytics PM ticket already seeded by the storefront launch plan. Add a `rail_product_clicked { rail }` event when that ticket runs.

## 3. Scope

### In-Scope
- Fetch store fulfilment settings (§5.17) and pickup locations (§5.18) through our server proxy.
- Checkout: delivery/pickup choice, Nigerian delivery address form, pickup location choice, delivery fee/note shown before submit.
- Send the fulfilment fields at checkout; allowlist the fields our checkout proxy forwards.
- Order confirmation: show delivery address or pickup location, delivery fee or note.
- Homepage product rails: Featured, New Arrivals, Best Sellers, as horizontally scrolling rows with swipe, snap and prev/next buttons.
- Products proxy passes `sort` (allowlisted) and `featured`.

### Out-of-Scope
- Saved addresses for logged-in shoppers (§5.21). They type the address each time this cycle.
- Sale price / discount display, variant labels/swatches, variant images (separate ticket).
- Related products on the product page (§5.20), reviews, wishlist, back-in-stock.
- Sorting controls on /shop; the rails' "View all" goes to /shop unsorted.
- "New"/"Best seller" badges on cards.
- Analytics instrumentation.
- Autoplay on rails (never; see Design).

## 4. Requirements

### Functional
- **R1** As a shopper, I want to choose delivery or pickup at checkout, from only the options the store offers, so that my order can be fulfilled.
- **R2** As a shopper choosing delivery, I want to enter my recipient name, phone, address, city, state (Nigerian states + FCT) and an optional landmark, so the store can deliver.
- **R3** As a shopper choosing pickup, I want to pick one of the store's pickup locations (name, address, phone) so I know where to collect.
- **R4** As a shopper, I want to see the delivery fee (or free delivery, or the store's delivery note) and the resulting total before placing my order.
- **R5** As a shopper, I want the order confirmation to show where my order is going (address or pickup location) and any delivery fee or note.
- **R6** As a shopper on the homepage, I want to browse Featured, New Arrivals and Best Sellers in swipeable rows, so I can find pieces without going to /shop first.
- **R7** As the merchant, I want a rail with no products to not appear at all, rather than show an empty band.

### Non-Functional
- **N1** The checkout proxy forwards only documented checkout fields to Duka. Unknown fields are dropped.
- **N2** API secrets remain server-side (existing architecture; no browser → Duka calls).
- **N3** Rails load independently of the page; a rail failure never breaks the homepage.
- **N4** Rails are keyboard operable and respect `prefers-reduced-motion`.

## 5. Constraints & Assumptions
- Next.js 16 / React 19 / Tailwind 4 / TanStack Query; no new dependencies (no Swiper). The codebase avoids animation libraries by convention.
- Assumes the Duka API release is (or will be) deployed on the tenant's host. If not, `/store` returns 404 (see Risks).
- Checkout mode (WhatsApp vs Paystack) is unchanged. Fulfilment data is sent in both modes.
- Delivery states: the 36 Nigerian states + FCT, matching §5.9.

## 6. Risks
| Risk | Mitigation / Owner |
|---|---|
| API release not yet live → `/store` 404s, checkout can't show options | Checkout shows a "couldn't load delivery options" error with retry + WhatsApp fallback; verify live before deploy (Owner: Onyedika) |
| Merchant has neither delivery nor pickup enabled | Show the API's own copy ("isn't taking online orders") and disable Place Order |
| Rail content is empty (no featured products set) | R7: rail hides itself |
| Best-selling list is thin on a new store | API falls back to newest for unsold products (§5.2) |
| Duplicate products across rails | Accepted; lists are curated by different signals |

## 7. Prioritization (MoSCoW)
| Req | Priority |
|---|---|
| R1, R2, R3, N1, N2 | Must |
| R4 | Must |
| R5 | Should |
| R6, R7, N3, N4 | Should |
| Saved addresses | Won't (this cycle) |
| Related products, badges, /shop sorting | Won't (this cycle) |

## 8. Acceptance Criteria
- **R1** With delivery and pickup both enabled, checkout shows both options; with only one enabled, only that one is offered and preselected; with neither, Place Order is disabled and the shopper sees "This store isn't taking online orders right now."
- **R2** Submitting delivery with any required address field empty is blocked in the browser; State is a select of exactly 37 values. The request body carries `fulfilmentMethod: "delivery"` and `deliveryAddress` with the entered values (landmark omitted when blank).
- **R3** Pickup lists every location from §5.18; the request body carries `fulfilmentMethod: "pickup"` and `pickupLocationId`, and no `deliveryAddress`.
- **R4** Flat fee mode shows "Delivery ₦X" and a total = cart total + fee; fee 0 shows "Free"; note mode shows the note text and no fee line. Pickup shows no delivery line.
- **R5** Confirmation for a delivery order shows the recipient, address, city and state; for a pickup order, the location name and address; a delivery fee line appears when fee > 0.
- **R6** The homepage renders up to three rails (Featured, New Arrivals, Best Sellers), each ≤ 10 products, with the product card's hover image swap. They are swipeable on touch, and on desktop the prev/next buttons scroll by one viewport of cards. The buttons are disabled at the ends.
- **R7** A rail whose request returns 0 visible products (or errors) renders nothing.
- **N1** A POST to `/api/storefront/checkout` with an extra field (e.g. `"totalMinorUnits": 1`) reaches Duka without that field.
- **N4** Rail buttons are real `<button>`s with labels ("Previous"/"Next" + rail name); with reduced motion, scrolling is instant.

## 9. Definition of Ready — Gate Check
- [x] Problem statement is specific and falsifiable
- [x] At least one success metric quantified with baseline and target (M1, M2)
- [x] Explicit Out-of-Scope list
- [x] Every requirement has an acceptance criterion
- [x] Requirements prioritized (Must/Should/Won't)
- [x] Risks non-empty
- [x] No placeholder text
- [ ] File committed at `docs/pm/storefront-api-readiness-prd.md`: pending the owner's commit

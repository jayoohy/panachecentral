# Design Spec — Panache Central Storefront

**Track:** A
**Source PRD:** `docs/pm/panache-central-website-prd.md`
**Visual system source:** `docs/panache-central-website-reference.md` (palette, typography, hero concept), `docs/panache-central-homepage-content.md` (locked homepage copy)

---

## 1. Traceability Map

| PRD Requirement (§4.1) | Screen(s) / Flow(s) |
|---|---|
| 1. Homepage | Homepage |
| 2. Category browsing | Category Listing |
| 3. Product detail | Product Detail |
| 4. Cart persistence | Cart (drawer + page), present as a component across all screens |
| 5. Coupon | Cart |
| 6. Guest checkout | Checkout |
| 7. Account-linked checkout | Checkout, Login/Register (modal or route) |
| 8. Gateway handling | Checkout → Payment Redirect (external) → Order Confirmation |
| 9. Order confirmation | Order Confirmation |
| 10. Reduced-motion hero | Homepage (hero sequence states) |
| 11. Order history | Account → Order History, Account → Order Detail |

---

## 2. User Flows

### Flow A — Browse → Buy (guest, primary flow)
1. Homepage → clicks a category card in "The Collection" or a nav link
2. Category Listing → clicks a product card
3. Product Detail → selects variant → "Add to Cart"
4. Cart Drawer opens (slide-in, not a route change) → "View Cart" or "Checkout"
5. Cart Page → reviews items, optionally applies coupon → "Checkout"
6. Checkout → fills name/email/phone → "Place Order"
7a. **Gateway active:** browser redirects to gateway's hosted page → customer pays → redirected back to Order Confirmation
7b. **No gateway:** browser navigates directly to Order Confirmation
8. Order Confirmation → sees items, total, payment status

**Alternate/failure paths:**
- Empty cart at checkout → Checkout route redirects back to Cart with an inline message, "Your cart is empty."
- Variant chosen has `stock: 0` → Add to Cart button is disabled at Product Detail, never reaches cart with that state
- Stock conflict at checkout (`400`) → Checkout shows inline error naming the affected item, link back to Cart to adjust quantity
- Coupon invalid → Cart shows the API's returned reason inline under the coupon field, cart totals unchanged
- Payment abandoned/cancelled at gateway → customer lands back at `returnUrl` with `paymentStatus: pending` or `failed` → Order Confirmation shows the corresponding state (see §3)

### Flow B — Browse → Buy (logged-in)
Same as Flow A, but before or during Checkout the shopper can log in (Login modal, triggered from header or checkout page); once logged in, Checkout pre-fills name/email from the account profile, and the resulting order is auto-linked — no separate UI decision needed at checkout for this ("nothing to add to this body," per the API).

**Alternate path:** shopper registers instead of logging in (Register modal) — same downstream effect.

### Flow C — Account & Order History
1. Header → "Account" (logged out) → Login modal → on success, header updates to show account menu
2. Header → account menu → "My Orders" → Account: Order History
3. Order History → clicks an order → Account: Order Detail

**Alternate/failure paths:**
- Wrong password at login → inline error, form retains email, password field clears
- Forgot password → Forgot Password screen → generic confirmation message (never reveals whether the email exists, per API contract) → Reset Password screen (from emailed link) → success → redirected to Login

### Flow D — Guest order lookup (post-purchase, no account)
1. Customer clicks the link in their order-confirmation email → lands on Order Confirmation using the token route, no login required
2. **Failure path:** token expired (>90 days) or reused for a different order → explicit "This link is no longer valid" state, with no fallback lookup offered this cycle (per PRD, out of scope)

---

## 3. Screen & State Inventory

Legend: **D**=Default, **L**=Loading, **E**=Empty, **Er**=Error, **S**=Success

### 3.1 Homepage
- **D:** All 9 sections render per `panache-central-homepage-content.md`, hero at rest (frame 0, scroll not yet engaged).
- **L:** Hero image sequence frames not yet loaded — show frame-0 static image only (no spinner; this *is* the loading state, per the reference doc's "static render of frame 0 first" build order).
- **E:** N/A — homepage content is static/locked, not data-driven.
- **Er:** Hero sequence assets fail to load — fall back to a single static hero image (frame 0) with headline/subhead/CTA still functional; site remains usable.
- **S:** N/A — no submission action on this screen (CTA navigates to Category Listing).
- **Reduced-motion variant:** `prefers-reduced-motion: reduce` → hero renders the payoff frame (beat 3, "piece transitions onto the body") statically, no scroll-scrub binding at all, no motion of any kind.

### 3.2 Category Listing
- **D:** Grid of product cards (thumbnail, name, category) for the selected category.
- **L:** Skeleton grid (card-shaped placeholders, matching card aspect ratio) while `GET /catalogue/products` resolves.
- **E:** Category has zero active products — centered message: "No pieces in [Category] yet. Explore the full collection." with a link to the all-categories view.
- **Er:** API/network failure — centered message: "We couldn't load this collection. Try again." with a retry button.
- **S:** N/A.

### 3.3 Product Detail
- **D:** Image gallery, name, category, description, variant selector, price (for selected variant), Add to Cart button.
- **L:** Skeleton layout while `GET /catalogue/products/:slug` resolves.
- **E:** N/A (a product with no images shows a placeholder image tile, not an empty state; a product with no variants is not a valid catalogue state per the API).
- **Er:** `404` (product not found/inactive) — "This piece is no longer available." with a link back to its category (or the homepage if category is unknown); network failure — same retry pattern as Category Listing.
- **S:** Add-to-cart success — brief inline confirmation + Cart Drawer auto-opens showing the updated line.
- **Variant states:** in-stock variant (selectable), out-of-stock variant (visibly disabled, labeled "Out of stock," not simply hidden).

### 3.4 Cart (Drawer + Page — same states, two surfaces)
- **D:** Line items (thumbnail, name, variant attributes, quantity stepper, line total), subtotal/tax/discount/total, coupon field, Checkout button.
- **L:** Line-level loading indicator on the item being updated (quantity change/removal in flight) — rest of cart stays interactive.
- **E:** No items — "Your cart is empty." + "Browse the Collection" CTA; Checkout button hidden in this state.
- **Er:** Coupon rejected — inline error under the coupon field naming the API's reason; general cart-fetch failure — retry pattern, same as Category Listing.
- **S:** Coupon applied — coupon field replaced with an applied-code chip + "Remove" action; totals update.

### 3.5 Checkout
- **D:** Contact fields (name/email/phone), order summary (read-only, pulled from cart), "Place Order" button; login/register entry point for shoppers who aren't logged in yet.
- **L:** "Place Order" button shows a busy state, disabled to prevent double-submit, while `POST /checkout` is in flight.
- **E:** N/A (empty cart redirects out of this screen entirely — see Flow A alternate paths).
- **Er:** Cart not found (`404`) — redirect to Cart with message "Your session expired, please review your cart."; stock conflict or missing-variant (`400`) — inline error naming the affected item(s), link back to Cart; missing `returnUrl` scenario is a build-time concern (the storefront always supplies it), not a user-facing state.
- **S:** Order placed — either full-page redirect to the gateway (external) or client-side navigation to Order Confirmation.

### 3.6 Order Confirmation
- **D:** Items purchased, totals, `paymentStatus` badge, order reference.
- **L:** `paymentStatus: pending` immediately after a gateway redirect — show a "Confirming your payment…" state that polls briefly (a few seconds, bounded) before settling into D or Er.
- **E:** N/A.
- **Er:** `paymentStatus: failed` — "Payment didn't go through" with guidance to return to Cart and try again (cart is gone after checkout, so this means re-adding items — message accordingly, not implying the same cart is recoverable); invalid/expired guest token — "This link is no longer valid."
- **S:** `paymentStatus: paid` (or no-gateway checkout success) — full confirmation with a reassuring tone, no "Confirming…" language.

### 3.7 Login / Register (modal, reachable from header or Checkout)
- **D:** Login: email + password fields. Register: name + email + password (+ optional phone) fields.
- **L:** Submit button busy state.
- **E:** N/A.
- **Er:** Login — `401` shows "Incorrect email or password."; Register — `409` shows "An account with this email already exists." with a link to switch to Login.
- **S:** Modal closes, header reflects logged-in state.

### 3.8 Forgot / Reset Password
- **D:** Forgot: email field. Reset: new-password field (token read from the emailed link's URL).
- **L:** Submit button busy state.
- **E:** N/A.
- **Er:** Reset — expired/reused token: "This reset link is no longer valid. Request a new one." with a link back to Forgot Password.
- **S:** Forgot — generic confirmation message (verbatim, per API contract, regardless of whether the email matched an account): "If that account exists, we've sent a reset link." Reset — success message + redirect to Login.

### 3.9 Account: Order History
- **D:** Paginated list of past orders (reference, date, status, total), newest first.
- **L:** Skeleton list while `GET /account/orders` resolves.
- **E:** No orders yet — "No orders yet. Start with the Collection." + CTA.
- **Er:** Retry pattern, same as Category Listing.
- **S:** N/A (navigational list, not a submission).

### 3.10 Account: Order Detail
- **D:** Same layout as Order Confirmation (items, totals, status).
- **L:** Skeleton while `GET /account/orders/:id` resolves.
- **E:** N/A.
- **Er:** Order belongs to another customer or doesn't exist — both render as "Order not found" (the API itself returns `404` for both cases, so the UI cannot and must not distinguish them).
- **S:** N/A.

### 3.11 Coming Soon (shared stub)
- **D:** Brand-consistent single-message page ("This page is on its way.") used for all footer Company/Legal links this cycle, plus the homepage Trust section and any unanswered FAQ item.
- No other states — this is intentionally minimal, not a data-driven screen.

---

## 4. Information Architecture

**Primary nav (header, persistent):** Logo (serif wordmark, links home) — Rings — Necklaces — Earrings — Bracelets — Cart icon (item count badge) — Account icon (Login or account menu, depending on session state).

**Footer nav:** Shop (4 categories) — Company (About, Care & Materials, Contact — all → Coming Soon stub) — Legal (Privacy, Terms, Shipping & Returns — all → Coming Soon stub) — footer line ("Panache Central. Jewelry, Not Trends.").

**Navigation depth:** Homepage → Category (1 click) → Product Detail (2 clicks) → Cart (drawer, no navigation cost) → Checkout (3 clicks) → Confirmation (4 clicks). No path in the primary purchase flow exceeds this.

**Back/forward behavior:** Standard browser back/forward works throughout except: (a) after checkout succeeds, the Cart route is intentionally empty (cart id is invalidated) — back button from Order Confirmation to Cart shows the Empty Cart state, not an error; (b) the gateway redirect leaves the site entirely — back button behavior there is the gateway's, not ours.

**Cart:** persistent drawer accessible from every screen via the header cart icon; a dedicated Cart page exists at its own route for direct linking/refresh, both read the same underlying cart state.

---

## 5. Component Inventory

| Component | Screens used | Tag |
|---|---|---|
| Header (nav + cart icon + account icon) | All | [NEW] |
| Footer | All | [NEW] |
| Hero Scroll Sequence | Homepage | [NEW] — no existing scroll-scrub component in this fresh project |
| Section Block (header + body, Onyx/Bone alternating background) | Homepage | [NEW] |
| Product Card | Category Listing | [NEW] |
| Skeleton Card / Skeleton List | Category Listing, Order History | [REUSE] once built — one skeleton primitive reused everywhere |
| Empty State | Category Listing, Cart, Order History | [REUSE] once built — one empty-state primitive with swappable message/CTA |
| Retry Error State | Category Listing, Product Detail, Cart, Order History | [REUSE] once built — one error-state primitive |
| Image Gallery | Product Detail | [NEW] |
| Variant Selector | Product Detail | [NEW] |
| Cart Line Item | Cart Drawer, Cart Page | [REUSE] — identical component in both surfaces |
| Coupon Field | Cart | [NEW] |
| Cart Drawer (slide-in panel) | All (triggered from Header) | [NEW] |
| Order Summary (read-only) | Checkout, Order Confirmation, Account Order Detail | [REUSE] — same presentation of items/totals across all three |
| Contact Form (name/email/phone) | Checkout | [NEW] |
| Auth Modal (Login/Register tabs) | Header, Checkout | [NEW] |
| Password Field with visibility toggle | Auth Modal, Reset Password | [REUSE] |
| Payment Status Badge | Order Confirmation, Account Order History/Detail | [NEW] |
| Pagination Control | Category Listing (if >20 items), Order History | [NEW] |
| Coming Soon Stub | Footer links, Trust section, unanswered FAQ items | [REUSE] — one primitive, reused everywhere per §3.11 |
| Toast/Inline Confirmation | Product Detail (add-to-cart), Coupon apply | [NEW] |

---

## 6. Responsive & Platform Behavior (web, breakpoints)

| Breakpoint | Range | Behavior notes |
|---|---|---|
| Mobile | < 640px | Single-column; header collapses to logo + hamburger + cart/account icons; Cart Drawer becomes a full-screen sheet, not a side panel; hero sequence uses the reduced-motion fallback whenever `prefers-reduced-motion` OR autoplay is restricted by the browser (treat both the same way per PRD §4.2) |
| Tablet | 640–1024px | 2-column product grid; header nav fully visible; Cart Drawer becomes a right-side panel at ≥768px |
| Desktop | > 1024px | 3–4 column product grid (match existing category card sizing once built); hero sequence at full pinned-scroll behavior |

Touch targets ≥ 44×44pt on all interactive elements at mobile width (quantity steppers, variant chips, nav icons). No horizontal scroll at any width except the product grid's own internal scroll-snap, if used, which must not be the only way to reach off-screen content (grid also reflows/wraps).

---

## 7. Accessibility Requirements

- **Conformance target:** WCAG 2.1 AA sitewide.
- **Contrast:** Champagne Gold (#C9A24B) on Onyx Black (#0A0A0A) and Deep Bronze (#8A6A3B) text on Bone White (#F5F1EA) must both be verified ≥ 4.5:1 for body text, ≥ 3:1 for large text (≥24px) — if Champagne Gold on Onyx Black fails 4.5:1 at body size, restrict gold to large text/CTAs/accents only and use Bone White for body copy on dark sections (this is a verification task at build time, not a copy change now).
- **Focus order:** logical DOM order matching visual order on every screen; Cart Drawer and Auth Modal trap focus while open and return focus to the triggering element on close.
- **Screen-reader labels:** cart icon announces item count ("Cart, 3 items"); variant selector options are labeled with their attribute name and value, not just a swatch/color chip; Payment Status Badge has a text equivalent, not color-only signaling (e.g. not just a red/green dot).
- **Touch targets:** 44×44pt minimum, per §6.
- **Motion:** hero scroll-scrub sequence fully disabled under `prefers-reduced-motion: reduce`, per §3.1 — this is the accessibility requirement driving that state, not merely a performance fallback.
- **Forms:** every input has a visible label (not placeholder-only); errors are associated with their field via `aria-describedby` and announced on submit failure.

---

## 8. Microcopy

Homepage copy is locked verbatim from `docs/panache-central-homepage-content.md` — not repeated here. New microcopy needed for storefront screens not covered by that doc:

| Context | Copy |
|---|---|
| Category empty state | "No pieces in [Category] yet. Explore the full collection." (link: "View All") |
| Category/Product/Order-history load error | "We couldn't load this. Try again." (button: "Retry") |
| Product unavailable | "This piece is no longer available." (link: "Back to [Category]") |
| Out-of-stock variant | "Out of stock" |
| Add-to-cart confirmation | "Added to cart" |
| Empty cart | "Your cart is empty." (button: "Browse the Collection") |
| Coupon invalid | *(render the API's own message verbatim — do not rewrite: "Coupon is not valid" / "Coupon has expired" / "Coupon redemption limit reached" / "Order does not meet the coupon minimum")* |
| Coupon applied | "Code applied" (with the code shown, e.g. "SAVE-AB12CD applied") |
| Checkout — expired cart | "Your session expired, please review your cart." |
| Checkout — stock conflict | "[Product name] no longer has enough stock. Update your cart to continue." |
| Checkout — placing order (busy) | "Placing your order…" |
| Confirmation — confirming payment | "Confirming your payment…" |
| Confirmation — payment failed | "Payment didn't go through. Your items weren't reserved — please start again from the Collection." |
| Confirmation — invalid guest link | "This link is no longer valid." |
| Login — wrong credentials | "Incorrect email or password." |
| Register — email taken | "An account with this email already exists." (link: "Log in instead") |
| Forgot password — confirmation (always shown, verbatim per API) | "If that account exists, we've sent a reset link." |
| Reset password — expired token | "This reset link is no longer valid. Request a new one." |
| Order history — empty | "No orders yet. Start with the Collection." |
| Order not found (own account) | "Order not found." |
| Coming Soon stub | "This page is on its way." |
| Cart icon a11y label pattern | "Cart, {n} items" |

No copy above claims a capability, timeline, or policy the business hasn't confirmed — all are either neutral system states or the API's own validated error text.

---

## 9. Design Acceptance Criteria

1. Hero sequence's reduced-motion fallback is triggered and visually verified in a browser DevTools "prefers-reduced-motion: reduce" emulation pass — no scroll-scrub JS runs in that state.
2. Cart Drawer opens within 300ms of a successful add-to-cart action, and reflects the new line item without a full page reload.
3. Category grid, viewed at 375px width (mobile baseline), shows a single column with no horizontal scroll and all touch targets ≥ 44×44pt.
4. Checkout form shows an inline validation/error state within 300ms of the relevant API response — no silent failures.
5. Every screen in §3 with an Error (Er) state has been manually triggered at least once (e.g. via a simulated network failure or an intentionally invalid coupon) and visually confirmed to match this spec, not left as a hypothetical.
6. Champagne Gold-on-Onyx-Black and Deep-Bronze-on-Bone-White contrast ratios are measured with a contrast checker and recorded as passing before the Software Engineer stage begins (feeds PRD Acceptance Criteria #12 and the Accessibility requirement in §7 above).

   **Measured (WCAG relative-luminance formula):**
   | Pair | Ratio | Result |
   |---|---|---|
   | Champagne Gold (#C9A24B) on Onyx Black (#0A0A0A) | 8.25:1 | Passes AA for body text (≥4.5:1) — gold may be used for body copy on dark sections, not just accents |
   | Bone White (#F5F1EA) on Onyx Black (#0A0A0A) | 17.59:1 | Passes AA comfortably — default body text color on dark sections |
   | Deep Bronze (#8A6A3B) on Bone White (#F5F1EA) | 4.44:1 | Fails AA for body text (<4.5:1) — restricted to large text/headings (≥24px, passes the 3:1 large-text threshold) and accents only |
   | Onyx Black (#0A0A0A) on Bone White (#F5F1EA) | 17.59:1 | Passes AA comfortably — default body text color on light sections |

   **Resulting build rule:** body copy on Onyx sections may use Bone White or Champagne Gold; body copy on Bone sections uses Onyx Black; Deep Bronze is reserved for large headings and decorative accents on Bone sections only.

---

## 10. Definition of Ready — GATE

- [x] Every Must/Should PRD requirement has at least one row in the Traceability Map (Section 1)
- [x] Every screen has default, loading, empty, error, success states defined or explicitly marked N/A with reasoning (Section 3)
- [x] No microcopy is placeholder text (Section 8 — all copy is final system-state or API-verbatim text; "Coming Soon" is a deliberate, final piece of copy per the PRD's content-gap decision, not a stand-in for missing design work)
- [x] Component inventory tags every component `[REUSE]` or `[NEW]` (Section 5)
- [x] Accessibility requirements are specific values, not "make it accessible" (Section 7)
- [x] Responsive/platform behavior is specified for every screen that isn't fixed-layout (Section 6)
- [x] Design Acceptance Criteria exist and are testable by someone who isn't the operator (Section 9)
- [x] File is committed at `docs/design/panache-central-website-design-spec.md`

### Waiver: Hero backdrop final choice
**Reason:** `docs/panache-central-website-reference.md` §7 leaves the hero backdrop (Onyx Black / Bone White / neutral marble) as an open decision; this spec defaults to Onyx Black (per PRD §9) to avoid blocking the gate, but the operator hasn't explicitly confirmed it.
**Owner:** Solo operator
**Revisit by:** Before hero asset production begins (Flow AI prompt drafting)

**Gate status: PASSED.** Ready to proceed to Software Engineer stage — **not started per this session's scope** (user requested stopping after the Designer stage).

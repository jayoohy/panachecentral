# Design Spec: Panache Central Customer Storefront

**Track:** A · **Source PRD:** `docs/pm/panache-storefront-prd.md` (GATE PASSED)
**Craft skills applied:** `impeccable` (design laws / anti-slop), `transitions-dev` (motion primitives), `ui-ux-pro-max` (hierarchy/accessibility/spacing discipline, adapted from RN to web), `emil-design-eng` (animation decision framework, easing, perceived performance)

---

## 0. Design Strategy — read this before the sections below

**Color strategy:** the brand palette is locked (`docs/panache-central-website-reference.md` §2) — onyx `#0A0A0A`, gold `#C9A24B`, bone `#F5F1EA`, bronze `#8A6A3B`. That's a **Restrained** palette (tinted neutrals + one accent) already, so the craft work here isn't picking new colors — it's deciding *where* each one carries weight so the storefront doesn't default to the obvious "luxury jewelry = all-black-and-gold" reflex.

**Scene test:** a shopper is on her phone, evenings on the couch or mid-commute, comparing a ring against her own hand or a necklace against an outfit photo. She needs to see the *true color* of steel, gold, and moissanite — a dark scrim over product photography actively works against that. The brand guide itself says jewelry photography sits on "solid Onyx Black, Bone White, or neutral stone/marble" — never both at once in a way that muddies the piece.

**Decision:** the marketing site's dark-chrome (`Header`/`Footer`, already onyx) stays as-is — that's the brand's front door. But the **shopping surfaces** (catalogue, product detail, cart, checkout, account) run on a **Bone canvas**: light, gallery-like, lets the metal/stone photography do the work, and reads as calmer for the transactional parts of the flow (forms, totals, order history) where legibility beats mood. Gold is reserved for what it's for in the brand guide — CTAs, accent lines, price emphasis, selected states — never as body text on Bone (contrast fails there; see §7).

This is a deliberate rejection of the first-order "dark luxury e-commerce" reflex, and the second-order "then make it editorial-dark to be different" trap — it's light because the product photography and the shopper's task (comparing true material color) need it to be.

**One scoped exception to the locked palette:** form validation and stock/payment-failure states need a real error color for accessibility (color contrast + non-color-alone signaling). Bronze doesn't read as "error" against Bone at a glance. Introducing **`--color-error: #B3261E`** (WCAG AA on Bone, 5.9:1) — used *only* for system feedback (invalid field borders/text, stock-conflict banners, payment-failed state), never in brand/marketing contexts. Flagged here rather than silently done.

**Anti-slop checklist applied throughout (see §5 for specifics):** no side-stripe borders, no gradient text, no glassmorphism, no hero-metric tiles, no repeated icon+heading+text card grids, cart uses a slide-in panel (justified — reachable from every page) rather than a modal-as-first-thought.

---

## 1. Traceability Map

| PRD Requirement | Screen(s) / Flow(s) |
|---|---|
| F1 — browse by category/search | Header category nav, `/shop` (Product Listing) |
| F2 — variant/price/stock on detail | `/products/[slug]` (Product Detail) |
| F3 — cart add/update/remove, persisted | Cart Drawer (global) + `/cart` (Cart Page) |
| F4 — coupon apply/remove | Cart Drawer / `/cart` — Coupon block |
| F5 — guest or logged-in checkout | `/checkout` |
| F6 — gateway redirect + confirmation | `/checkout` → external gateway → `/order-confirmation` |
| F7 — no-gateway checkout path | `/checkout` → `/order-confirmation` (no redirect leg) |
| F8 — order confirmation/tracking | `/order-confirmation`, guest token variant of same |
| F9 — register/login/order history | `/account/login`, `/account/register`, `/account`, `/account/orders`, `/account/orders/[id]` |
| F10 — forgot/reset password | `/account/forgot-password`, `/account/reset-password` |
| Non-functional — secret isolation | All screens (server-only data layer, no UI surface) |

## 2. User Flows

**Flow A — Browse → Buy (guest, gateway active)**
Header category link → `/shop` grid (filter/search optional) → tap product → `/products/[slug]` → select variant → Add to Cart (inline success, cart badge increments) → open Cart Drawer → adjust qty / apply coupon → "Checkout" → `/checkout` → fill contact fields → "Place Order" → redirected to gateway → pay → returned to `/order-confirmation?orderId=…` → poll until `paymentStatus` resolves.
*Failure branch:* stock conflict at checkout (400) → inline banner on `/checkout`, cart items highlighted, no navigation away. Coupon silently invalidated mid-flow → banner "Coupon removed — it's no longer valid" on next cart read, total recalculated.

**Flow B — Browse → Buy (guest, no gateway)**
Same as Flow A up to "Place Order" → no `payment` key in response → straight to `/order-confirmation?orderId=…`, no redirect leg, no pending-payment polling state (nothing to poll if no gateway — confirmation shows order as placed, no `paymentStatus` chip needed since the field will read whatever the tenant's non-gateway default is, but not surfaced as "pending" to avoid implying a stuck payment).

**Flow C — Register → logged-in checkout**
`/account/register` → session cookie set → shopper continues browsing/cart as before → `/checkout` now shows "Checking out as {name}" instead of the guest contact form (email/phone pre-filled from account, editable) → same as Flow A from "Place Order" on.
*Failure branch:* email already registered (409) → inline field error + "Log in instead" link to `/account/login` (keeps whatever cart id they had).

**Flow D — Forgot password**
`/account/login` → "Forgot password?" → `/account/forgot-password` → submit email → generic confirmation shown regardless of match → shopper opens emailed link → `/account/reset-password?token=…` → set new password → success → redirect to `/account/login` with a "Password updated — log in" notice.
*Failure branch:* expired/reused token (reset endpoint rejects it) → inline error + "Request a new link" back to forgot-password.

**Flow E — Returning customer, order history**
`/account/login` → `/account` (profile) → "Orders" tab → `/account/orders` (paginated list) → tap a row → `/account/orders/[id]` (full detail, same shape as confirmation page minus the payment-redirect concerns).

## 3. Screen & State Inventory

| Screen | Default | Loading | Empty | Error | Success |
|---|---|---|---|---|---|
| `/shop` (grid) | Products render, category chips, search bar | Skeleton grid (8 shimmer tiles) while fetching | "No pieces match your search." + clear-filters CTA | Fetch failure → inline retry banner, chips/search stay usable | — (browsing has no terminal success state) |
| `/products/[slug]` | Images, variant selector, price, Add to Cart | Skeleton (image block + text bars) | N/A — 404s to a not-found state if slug invalid/inactive | Fetch failure → retry banner, page shell stays | Add-to-cart inline confirmation (text swap + badge bump) |
| Cart Drawer / `/cart` | Line items, subtotal/tax/discount/total, coupon field, Checkout CTA | Line-level skeleton on first open; per-row spinner during a PATCH | "Your cart is empty." + Browse CTA | Coupon error inline (API message verbatim); PATCH failure → row reverts, inline retry | Coupon applied → discount line animates in |
| `/checkout` | Contact fields (or account summary if logged in), order recap, Place Order | Button loading state on submit (label swap + spinner), form disabled | N/A (cart empty → redirect back to `/cart` with a notice) | Stock-conflict / validation errors inline per field or as a top banner; `returnUrl`/gateway misconfig is a system error, not shown as a form error | Redirect to gateway (no in-page success state) or direct nav to confirmation |
| `/order-confirmation` | Order items, totals, fulfillment status, payment status | Skeleton while first `GET /orders/:id` resolves; polling indicator while `paymentStatus: pending` | N/A | Invalid/expired token or 404 → "We couldn't find this order" + link home | Success-check animation the moment `paymentStatus` flips to `paid` (once, not on every poll) |
| `/account/login` | Email/password fields | Button loading state on submit | N/A | Wrong credentials → shake + inline message, not tied to a specific field | Redirect to intended destination (checkout, account, or home) |
| `/account/register` | Name/email/phone/password fields | Button loading state | N/A | 409 duplicate → field-level error + "Log in instead"; weak password → inline hint | Redirect same as login |
| `/account/forgot-password` | Email field | Button loading state | N/A | Never shows a "not found" error (generic response by design) | Generic confirmation message replaces the form |
| `/account/reset-password` | New password field | Button loading state | N/A | Expired/used token → error + "Request new link" | Redirect to login with a confirmation notice |
| `/account` | Name/email/phone, link to Orders | Skeleton | N/A (profile always exists once logged in) | 401 → redirect to login with return-path preserved | — |
| `/account/orders` | Paginated order summary rows | Skeleton rows | "No orders yet." + Start Shopping CTA | Fetch failure → retry banner | — |
| `/account/orders/[id]` | Full order detail | Skeleton | N/A | 404 (not this customer's order) → "We couldn't find this order" | — |

## 4. Information Architecture

```
Header (global, dark chrome — unchanged from marketing site)
├── Panache Central (home)
├── Rings / Necklaces / Earrings / Bracelets  → /shop/[categorySlug]
├── Search (icon → inline expanding field, mobile: dedicated /shop?search= state)
├── Cart icon (badge = item count) → opens Cart Drawer (not a route)
├── Account icon
│   ├── logged out → /account/login
│   └── logged in → dropdown: My Account, My Orders, Log Out

/shop                     — all products, filterable
/shop/[categorySlug]      — pre-filtered by category (resolves slug → categoryId server-side)
/products/[slug]          — product detail
/cart                     — full-page cart (same CartView component the drawer renders, so there's exactly one cart implementation — see §5)
/checkout                 — single-step checkout (no multi-page wizard; F1–F10 doesn't require one and it's the fastest path to "Place Order")
/order-confirmation       — reads ?orderId=&token= (token present only for guest email-link entry)
/account/login
/account/register
/account/forgot-password
/account/reset-password
/account                  — profile, tab-links to Orders
/account/orders
/account/orders/[id]

Footer (global, unchanged)
```

Back/forward: every screen above is a real route except the Cart Drawer, which is UI state layered on whatever page it was opened from (closing it returns to that page, no history entry consumed) — the drawer and `/cart` render the same `CartView`, so a shopper who lands on `/cart` directly (bookmark, back button, no-JS) gets the identical content full-page instead of a broken empty shell.

## 5. Component Inventory

Tag: `[REUSE]` from the existing marketing site, `[NEW]`.

| Component | Tag | Notes |
|---|---|---|
| `Header` | `[REUSE]` extend | Wire real hrefs (currently inert per its own `ponytail:` comment), add cart badge + account dropdown, add search affordance |
| `Footer` | `[REUSE]` | Unchanged |
| `Button` | `[NEW]` | Currently ad hoc per-usage (see `FinalCtaSection`). Extract to `components/shared/Button.tsx` with `variant`: `primary-gold` (solid gold fill, onyx text — the one high-emphasis action per screen: Add to Cart, Place Order), `primary-onyx` (solid onyx fill, bone text — secondary emphasis, matches existing marketing CTA), `outline` (1px onyx/30 border, transparent fill — tertiary), `ghost` (text-only, for e.g. "Log out"). Shape/sizing matches the existing pill pattern (`rounded-full px-8 py-3 text-sm font-medium tracking-wide`); press feedback `scale(0.97)` 160ms ease-out on `:active` per `emil-design-eng`. Loading state swaps label for a spinner via blur-crossfade (§5.5 below), never disables silently without visual change |
| `PageHeading` | `[NEW]` | Left-aligned commerce page title (`font-serif text-2xl sm:text-3xl uppercase tracking-[0.1em]`) — distinct from marketing `SectionHeading` (centered, ceremonial `0.15em` tracking); commerce pages need fast scanning, not a hero moment |
| `CategoryChips` | `[NEW]` | Pill filter row, `[REUSE]`s the pill shape from `Button`'s outline variant; selected state = gold fill (not a side border — avoids the side-stripe anti-pattern) |
| `SearchField` | `[NEW]` | Debounced (300ms) text input, expands from an icon on mobile |
| `Pagination` | `[NEW]` | Simple prev/next + page indicator, not a full numbered pager (product counts are modest; matches "don't over-build" scope) |
| `ProductCard` | `[NEW]` | Photography-led: image fills the cell, name + category caption below, **no price** (API doesn't return price on the listing — see F2 note) and no card chrome (border/shadow) by default — a 1px `border-onyx/10` appears only on hover/focus, not permanently, so the grid doesn't read as the "identical bordered card" cliché |
| `VariantSelector` | `[NEW]` | Real `<button>` pills per attribute value (e.g. color swatches, size pills), `aria-pressed`, selected = gold ring, disabled (stock 0) = struck-through label + "Out of stock" visually-hidden text, not color alone |
| `AddToCartButton` | `[NEW]` | Wraps `Button` (`primary-gold`); on success, label text-swaps to "Added to Cart" for ~1.6s (transitions-dev text-states-swap) then reverts — no toast, no modal, lowest-overhead feedback that still confirms the action |
| `QuantityStepper` | `[NEW]` | 44×44pt hit targets on +/- despite compact visual size; quantity digit uses number-pop-in on change |
| `CartBadge` | `[NEW]` | Notification-badge transition (transitions-dev) on the header cart icon; `aria-label="Cart, {n} items"` |
| `CartDrawer` | `[NEW]` | Panel-reveal from the right, `role="dialog" aria-modal="true"`, focus-trapped, `Escape` closes and returns focus to the cart icon. Open 300–350ms / close 200ms (asymmetric — enter deliberate, exit snappy), `cubic-bezier(0.22,1,0.36,1)` |
| `CartView` | `[NEW]` | The actual cart content (line items, coupon, totals, checkout CTA) — rendered inside both `CartDrawer` and `/cart`'s page shell, so there is exactly one implementation of "what a cart looks like" |
| `CartLineItem` | `[NEW]` | Thumbnail, name, variant attributes, stepper, remove; remove action confirms via the row collapsing (card-resize transition), not a confirm dialog |
| `CartSummary` | `[NEW]` | Subtotal/tax/discount/total; respects `pricesIncludeTax` (label reads "Includes tax" vs. a separate tax line) |
| `CouponForm` | `[NEW]` | Input + Apply button; success = discount row fades/slides in; error = the input does an error-state-shake (transitions-dev) with the API's message shown verbatim below, `--color-error` text, auto-clears after the shake's revert-hold |
| `CheckoutForm` | `[NEW]` | Guest fields (name/email/phone) or an "Checking out as {name}" summary block when a session exists; field-level validation with error-state-shake + `aria-invalid`/`aria-describedby` |
| `OrderSummaryPanel` | `[NEW]` | Read-only recap reused on `/checkout` and `/order-confirmation` |
| `PaymentStatusBadge` | `[NEW]` | Translates `pending\|paid\|failed\|refunded` to "Awaiting Payment / Paid / Payment Failed / Refunded" — never the raw enum, always paired with an icon (not color alone) |
| `FulfillmentStatusBadge` | `[NEW]` | Translates the 8-step fulfillment enum to Title Case labels |
| `AuthForm` | `[NEW]` | Shared shell for login/register/forgot/reset — one component, different field sets, so the four auth screens don't fork into four bespoke layouts |
| `AccountNav` | `[NEW]` | Two tab-links: Profile, Orders |
| `OrderHistoryRow` | `[NEW]` | Order reference, date, item count, total, status badge — see §7 of the data-presentation rule: no raw `id` shown, a formatted short reference instead (see Microcopy) |
| `EmptyState` | `[NEW]` | Generic icon + heading + body + optional CTA, reused for empty cart / empty search / empty order history so there's one implementation, not three |
| `SuccessCheck` | `[NEW]` | transitions-dev success-check, gold stroke (not green — stays on-brand), used once on `/order-confirmation` when `paymentStatus` resolves to `paid` |
| `lib/format-money.ts` | `[NEW, util]` | `priceMinorUnits` → `"₦15,000"` — never render raw minor-unit integers, per the workspace's data-presentation rule |
| `lib/format-order-status.ts` | `[NEW, util]` | Enum → label maps backing the two status badges above |

## 6. Responsive & Platform Behavior

Mobile-first (primary traffic is mobile per the PRD's target user).

- **Breakpoints:** follow Tailwind defaults already in use elsewhere in the repo — base (< 640px), `sm:` (≥640px), `lg:` (≥1024px) for the grid stepping up to more columns.
- `/shop` grid: 2 columns base, 3 at `sm:`, 4 at `lg:` (matches the existing `CollectionSection` category-tile pattern).
- `/products/[slug]`: single column (image stack above details) base; two-column (image left, details right, sticky) at `lg:`.
- Cart Drawer: full-width slide-up-adjacent panel on mobile (covers ~92% of viewport width, scrim visible at the edge so it still reads as an overlay not a full page swap) / fixed 420px right-side panel at `sm:` and up.
- Checkout: single column throughout — a two-column "form left, summary right" split only at `lg:` (summary becomes a sticky sidebar).
- Touch targets: 44×44pt minimum on every interactive element regardless of breakpoint (stepper buttons, chip selections, close icons).
- Hover-only affordances (e.g., the `ProductCard` hover border) gated behind `@media (hover: hover) and (pointer: fine)` — no phantom hover states on touch.

## 7. Accessibility Requirements (WCAG 2.1 AA)

- **Contrast:** Onyx-on-Bone body text ≈19.6:1, Bone-on-Onyx chrome text ≈19.6:1 — both far over 4.5:1. **Rule: gold never appears as text on a Bone background** (fails contrast) — gold on Bone is fill-only (buttons, selected chips, focus rings, badges), text sits in onyx or bone on top of it. `--color-error` (#B3261E) on Bone = 5.9:1, passes for normal text.
- **Focus:** every interactive element gets a visible `2px solid` gold outline, `2px` offset, on `:focus-visible` — never removed without a replacement.
- **Touch targets:** 44×44pt minimum, stated per-component in §5/§6 above, not left implicit.
- **Screen readers:** cart icon `aria-label` reflects live count; variant pills are real buttons with `aria-pressed`; out-of-stock variants get `aria-disabled` + visually-hidden "Out of stock" text (never color alone); status badges pair icon + text (never color alone); cart total updates and coupon results announce via `aria-live="polite"`; payment-status polling changes announce the same way.
- **Keyboard:** Cart Drawer traps focus while open (`role="dialog" aria-modal="true"`), `Escape` closes and restores focus to the trigger; tab order in every form matches visual order.
- **Motion:** the repo's existing global `prefers-reduced-motion` block in `globals.css` already collapses all animation/transition durations to near-zero — every new transition in §5 must use CSS custom properties/transition classes (not one-off inline durations) so that global rule keeps working, not bypass it.

## 8. Microcopy

Voice per the brand guide: confident, not salesy, no stacked punctuation, no discount-forward language.

| Context | Copy |
|---|---|
| Add to Cart (default) | "Add to Cart" |
| Add to Cart (success, transient) | "Added to Cart" |
| Out-of-stock variant | "Out of Stock" (chip label) + "This option is currently unavailable." (helper text) |
| Empty cart | "Your cart is empty." / "Every piece here is made to be worn, not just bought." — CTA "Browse the Collection" |
| Empty search/grid | "No pieces match your search." / "Try a different term or explore by category." |
| Empty order history | "No orders yet." / "When you make a purchase, it will appear here." — CTA "Start Shopping" |
| Coupon success | "Code applied." |
| Coupon errors | Shown verbatim from the API — "Coupon is not valid.", "Coupon has expired.", "Coupon redemption limit reached.", "Order does not meet the coupon minimum." |
| Coupon silently dropped on re-read | "That code is no longer valid and was removed." |
| Checkout submit (default / loading) | "Place Order" / "Placing Order…" |
| Checkout stock conflict | "One or more items changed availability. Please review your cart before continuing." |
| Login prompt (non-blocking, on checkout) | "Have an account? Log in for faster checkout." |
| Confirmation heading | "Thank you. Your order is confirmed." |
| Confirmation, payment pending | "Confirming your payment — this can take a few seconds." |
| Confirmation, payment paid | "Payment confirmed." |
| Confirmation, payment failed | "Payment didn't go through. No charge was made — you're welcome to try again." — CTA "Browse the Collection" (the cart is gone after checkout regardless of outcome, and there's no retry-payment endpoint in the API, so the honest next step is a fresh cart, not a fake "retry") |
| Order reference display | "Order #A1B2C3D4" — first 8 characters of the order `id`, uppercased; a display-only convenience, not a stored field (the API has no human order number) |
| Login error | "Incorrect email or password." (doesn't say which — standard practice) |
| Register duplicate email | "An account with this email already exists." — link "Log in instead" |
| Password field hint | "At least 8 characters." |
| Forgot-password confirmation | "If that account exists, we've sent a reset link." (verbatim from the API by design — never implies whether the email matched) |
| Reset-password expired/used token | "This reset link has expired or was already used." — CTA "Request New Link" |
| Password updated | "Password updated. Log in with your new password." |
| Order not found (bad token / wrong customer) | "We couldn't find this order." — link "Back to Panache Central" |

## 9. Design Acceptance Criteria

- A shopper can go from `/shop` to a completed `/order-confirmation` in ≤6 taps on mobile (category or grid → product → variant → Add to Cart → Checkout → Place Order), excluding the external gateway's own payment form.
- Add-to-cart feedback (label text-swap + badge bump) completes within 300ms of the click — no spinner needed for this specific action since the cart mutation response is used directly, not polled.
- Every error state (coupon, checkout stock conflict, auth) is visible without scrolling on a 375px-wide viewport.
- No interactive element fails the 44×44pt touch-target check on a mobile emulator pass.
- Cart Drawer open→interactive (focus lands inside) in under 350ms; closing returns focus to the cart icon, verified with keyboard-only navigation.
- Coupon apply/remove, cart quantity changes, and the payment-status poll all re-render from the server response, never from client-guessed state (guards against the totals drifting from what checkout will actually charge, per the PRD's non-functional "correctness under drift" requirement).

## 10. Definition of Ready — Gate Check

- [x] Every Must/Should PRD requirement (F1–F10, plus coupons) has at least one row in the Traceability Map
- [x] Every screen has default/loading/empty/error/success defined, or explicitly marked N/A with reasoning (see §3 table)
- [x] No microcopy is placeholder text — §8 has real, final copy for every state referenced elsewhere in this spec
- [x] Component inventory tags every component `[REUSE]` or `[NEW]` (§5)
- [x] Accessibility requirements are specific values, not "make it accessible" (§7)
- [x] Responsive/platform behavior specified for every screen that isn't fixed-layout (§6)
- [x] Design Acceptance Criteria exist and are testable by someone who isn't the designer (§9)
- [x] File committed at `docs/design/panache-storefront-design-spec.md`

**GATE PASSED.**

---

## Downstream Contract

By passing this gate, the **Software Engineer** persona can assume:
- Every screen and state needed is enumerated in §3 — no inventing an error/empty/loading state mid-build.
- All copy in §8 is final — no placeholder strings to swap later.
- §5 pre-classifies every component as reuse-and-extend vs. build-new, including the specific extraction of a shared `Button` (currently inlined ad hoc, which the workspace's `code-separation.md` rule requires fixing regardless).
- Motion specifics (easing, duration, which `transitions-dev` primitive backs which interaction) are decided in §5/§7 — Engineering wires them up, it doesn't re-decide them.
- The one deliberate brand-palette exception (`--color-error`) is documented in §0 so Engineering doesn't need to ask, and Security/Growth don't mistake it for scope creep on the locked palette.

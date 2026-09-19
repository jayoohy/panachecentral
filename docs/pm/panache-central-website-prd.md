# PRD — Panache Central Storefront

**Track:** A (new customer-facing capability, multiple systems, new integration — Duka Storefront API)
**Owner:** Solo operator (Panache Central)
**Status:** Ready for Design

---

## 1. Problem Statement & Opportunity

Panache Central has a locked Brand Identity Guide, a scroll-reveal hero concept, full homepage copy, and a documented backend (Duka Storefront API) — but no website exists yet. Without a storefront, there is no way for a customer to discover the brand, browse the four launch categories (Rings, Necklaces, Earrings, Bracelets), or buy a piece online. The opportunity is narrow and specific: stand up a storefront that matches the locked brand system exactly (no generic ecommerce template feel) and lets a customer go from landing on the homepage to a completed, paid order without leaving the site.

This is falsifiable: today, a visitor to panachecentral's domain has nowhere to land and no way to purchase. After this project, a visitor can browse the four categories, view a product, add it to a cart, and complete checkout (guest or logged in).

---

## 2. Goals & Success Metrics

Pre-launch project with no traffic yet, so success metrics for this cycle are **launch-readiness metrics** (build-time verifiable), not traffic-based conversion metrics. Post-launch conversion tracking is explicitly deferred to the Growth Manager stage once real traffic exists.

| Metric | Baseline | Target |
|---|---|---|
| Locked homepage sections implemented per `docs/panache-central-homepage-content.md` | 0 of 9 sections | 9 of 9 sections shipped, copy matches doc verbatim where marked "locked" |
| Storefront purchase flow completeness | 0 of 5 steps (browse → detail → cart → checkout → confirmation) | 5 of 5 steps functional end-to-end against the Duka Storefront API in a staging tenant |
| Mobile Lighthouse Performance score | N/A (no site) | ≥ 90 |
| Mobile Lighthouse Accessibility score | N/A (no site) | ≥ 95 (supports the WCAG 2.1 AA target set in Section 4) |
| Storefront API secret exposure in browser bundle | N/A | 0 (verified via network tab inspection — `X-API-Secret` never appears in a client-side request) |

---

## 3. Scope

### In Scope
- Homepage: hero scroll-reveal sequence, positioning, benefits, "how it arrives," collection teaser, trust section (placeholder state — see Constraints), FAQ (answered items only), final CTA, footer — per `docs/panache-central-homepage-content.md`.
- Category listing pages for the four launch categories (Rings, Necklaces, Earrings, Bracelets), backed by `GET /catalogue/categories` + `GET /catalogue/products`.
- Product detail page with variant selection and stock-aware add-to-cart, backed by `GET /catalogue/products/:slug`.
- Cart (add/update/remove line items, coupon apply/remove), backed by `POST /cart`, `GET /cart/:id`, `PATCH /cart/:id`, `POST/DELETE /cart/:id/coupon`.
- Checkout (guest and logged-in), backed by `POST /checkout`, including both payment-gateway-active and no-gateway response handling.
- Order confirmation / tracking page, backed by `GET /orders/:id` (server-side) and the guest order-view token link (`GET /orders/:id/view?token=`).
- Customer accounts: register, login, logout, forgot/reset password, profile, order history — backed by `/account/*` routes.
- Reduced-motion and autoplay-restriction fallback for the scroll-reveal hero sequence (required step per the website reference doc's build order, not polish).
- Tagline locked sitewide: **"Fine Jewelry. Made to Last."**

### Out of Scope
- Admin dashboard or any `/platform/*`, `/staff`, non-`storefront`-prefixed catalogue/order routes.
- Footer "Company" pages (About, Care & Materials, Contact) and "Legal" pages (Privacy, Terms, Shipping & Returns) — these render as footer links to a single shared "Coming Soon" page this cycle; authoring their real content is a separate PM ticket once operational facts (shipping regions, return window, legal text) exist.
- Real trust/social-proof content and real FAQ answers for shipping, returns, and care (Section 6/7 of the homepage doc) — these render with an explicit "Coming Soon" state per the content-gap decision below, not fabricated content.
- Category teaser copy beyond the one-line placeholder already in the homepage doc.
- Multi-tenant support (this storefront serves exactly one Duka tenant: Panache Central).
- Multi-currency / i18n beyond the API's default `NGN`.
- Native mobile apps.
- Generating/finalizing the Flow AI hero footage itself (asset production is a prerequisite input, tracked as an open item below, not an engineering task in this PRD).

---

## 4. Requirements

### 4.1 Functional — User Stories

1. As a visitor, I want to see the brand homepage exactly as specified (hero, positioning, benefits, arrival experience, collection teaser, trust, FAQ, final CTA, footer) so that the site matches the locked brand system.
2. As a shopper, I want to browse products within a category (Rings/Necklaces/Earrings/Bracelets) so that I can find pieces I'm interested in.
3. As a shopper, I want to view a product's detail — images, description, variants, price, stock — so that I can decide whether to buy it.
4. As a shopper, I want to add a specific variant to my cart and have that cart persist across visits (even before I log in) so that I don't lose my selection.
5. As a shopper, I want to apply a coupon code to my cart and see the discount reflected before checkout.
6. As a shopper, I want to check out as a guest (name/email/phone) without being forced to create an account.
7. As a shopper, I want to optionally register/log in so that my order attaches to my account and I can see my order history later.
8. As a shopper, I want to be redirected to pay when the tenant has a payment gateway configured, and to complete checkout directly when it doesn't — without the UI breaking either way.
9. As a shopper, I want an order confirmation page that shows what I bought and my payment status, reachable either while logged in or via the emailed guest link.
10. As a shopper on mobile, I want the scroll-reveal hero to degrade gracefully (static reveal, not a broken/flickering animation) if reduced-motion is set or autoplay is restricted.
11. As a returning, logged-in shopper, I want to see my past orders.

### 4.2 Non-Functional

- **Performance:** Mobile Lighthouse Performance ≥ 90 (per Section 2). Static render of hero frame 0 must load before any scroll-binding JS, per the website reference doc's build order.
- **Accessibility:** WCAG 2.1 AA sitewide, including the scroll-scrubbed hero (reduced-motion fallback is a hard requirement, not optional).
- **Security:** `X-API-Key`/`X-API-Secret` must never reach the browser — all Duka Storefront API calls are proxied through the Next.js server (route handlers / server actions), never called client-side. Customer session cookie handling relies on the API's own `HttpOnly`/`Secure` cookie; the storefront must not duplicate session state client-side in a readable form.
- **Correctness:** Cart quantity updates are *sets*, not increments — client state management must send absolute quantities per the API's documented contract, not deltas.
- **Resilience:** Checkout must handle stock-conflict (`400`) and expired-cart errors gracefully with a user-facing message, since the cart API doesn't enforce stock — checkout does.
- **Data presentation:** All money values render formatted (₦ with thousands separators, converted from minor units), never raw integers; no raw database IDs, slugs used only where the API already designs them for public URLs (product/category slugs), internal UUIDs never shown to the shopper. (Per the workspace's user-relevant-data-presentation rule.)

---

## 5. Constraints & Assumptions

- **Tech stack:** Next.js (already scaffolded in this repo via `create-next-app`), deployed against a Duka tenant's Storefront API (`docs/storefront-api.md`).
- **Content-gap handling (explicit decision):** Trust/Social Proof and the unanswered FAQ items (care, shipping, returns) ship with a visible **"Coming Soon"** marker rather than being omitted or replaced with the brand guide's suggested craft/material-integrity fallback statement. This is a deliberate operator decision for this cycle — it does not fabricate any numbers or claims, so it doesn't conflict with the brand guide's anti-fabrication rule, it simply chooses the "explicit placeholder" option over the "skip/replace" option the guide also offered.
- **Hero footage is an external input:** the Flow AI-generated, frame-extracted, WebP-compressed image sequence is assumed to exist (or be produced in parallel) before the scroll-binding build step — this PRD does not cover generating that footage, only building the scroll-scrub mechanism against it.
- **Single tenant:** this storefront is built against exactly one Duka tenant (Panache Central) — no tenant-switching UI.
- **Payment gateway is opaque:** which gateway (Paystack/Flutterwave/Opay), if any, is active is a tenant-side admin setting outside this PRD's control — the storefront must handle both the gateway-active and no-gateway response shapes without assuming either.
- **Backdrop/tagline decisions inherited from `docs/panache-central-website-reference.md`:** tagline is locked to "Fine Jewelry. Made to Last." per this cycle's decision; the hero backdrop choice (Onyx Black vs. Bone White vs. neutral marble) remains an open item — see Section 9.

---

## 6. Risks

| Risk | Mitigation | Owner |
|---|---|---|
| AI-generated hero footage flickers during slow scroll-scrub (documented risk in the reference doc) | Generate and fully scroll-test one clip before committing to the full four-category set; static frame-0 render ships first, scroll-binding wired after | Solo operator |
| Storefront API secret leaks to the browser if any call is made client-side | All API calls proxied through Next.js server-side route handlers; verified via network tab as part of the Security Engineer stage | Solo operator |
| Cart preview tax total can shift slightly at checkout (documented API behavior — cart preview isn't location-aware, checkout is) | Checkout UI messages the total as "confirmed at checkout" rather than promising the cart total is final | Solo operator |
| Checkout-time stock conflicts (cart doesn't enforce stock, checkout does) | Explicit error state on the checkout page for stock-conflict `400`s, directing the shopper back to the cart | Solo operator |
| Unpaid orders auto-expire after 1 hour, releasing held stock | Checkout/payment-redirect UI communicates that the reservation is time-limited | Solo operator |
| Footer links to Company/Legal pages that don't have real content yet | Those routes ship as a single shared "Coming Soon" stub this cycle rather than 404s or fabricated legal text | Solo operator |
| Reduced-motion/autoplay fallback treated as "polish" and deprioritized under time pressure | Explicitly listed as a Must in Section 7, not a Could | Solo operator |

---

## 7. Prioritization (MoSCoW)

**Must**
- Homepage (all 9 sections, tagline locked)
- Category listing pages (4 categories)
- Product detail page with variant selection and stock-aware add-to-cart
- Cart (add/update/remove)
- Guest checkout, including gateway-active and no-gateway paths
- Order confirmation page (server-side and guest-token access)
- Server-side API secret proxying (security baseline)
- Reduced-motion / autoplay-restriction hero fallback
- WCAG 2.1 AA sitewide

**Should**
- Coupon apply/remove on cart
- Customer registration/login/logout
- Account order history

**Could**
- Forgot/reset password flow
- "Coming Soon" stub page for footer Company/Legal links (vs. simply hiding those links this cycle)

**Won't (this cycle)**
- Real trust/FAQ/legal content authoring (blocked on operational facts from the business, not an engineering task)
- Multi-tenant, multi-currency/i18n, native apps
- Post-launch conversion analytics dashboards (Growth Manager stage, after real traffic exists)

---

## 8. Acceptance Criteria

| # | Requirement | Acceptance Criteria |
|---|---|---|
| 1 | Homepage | All 9 sections from `docs/panache-central-homepage-content.md` render in order; hero headline/subhead/CTA copy matches the doc verbatim; tagline "Fine Jewelry. Made to Last." appears in hero and final CTA and footer line |
| 2 | Category browsing | Visiting a category page lists only `active`-status products in that category via `GET /catalogue/products?categoryId=`; empty category shows an explicit empty state, not a blank page |
| 3 | Product detail | Page renders name, description, images, category, and a variant selector; selecting a variant with `stock: 0` disables add-to-cart for that variant with a visible "out of stock" label; price renders formatted from `priceMinorUnits` |
| 4 | Cart persistence | Cart `id` persists in `localStorage`; reloading the page re-hydrates the cart via `GET /cart/:id`; adding the same variant twice sets (not increments) the quantity |
| 5 | Coupon | Applying a valid code updates `discountMinorUnits`/`totalMinorUnits` and displays `couponCode`; an invalid code shows the API's returned reason verbatim; a coupon that silently clears on a later `GET`/`PATCH` is reflected in the UI without a stale discount lingering |
| 6 | Guest checkout | Checkout succeeds with only `customerEmail` provided (name/phone optional); on success the stored cart id is cleared client-side |
| 7 | Gateway handling | When `payment.redirectUrl` is present, the browser is fully navigated there; when `payment` is absent, the flow proceeds straight to the confirmation route — both paths covered by a manual test against a staging tenant with and without a gateway configured |
| 8 | Order confirmation | Page renders items, totals, and `paymentStatus`; a `pending` status immediately after gateway redirect triggers a brief poll rather than an error state; the guest-token link (`/orders/:id/view?token=`) renders the same data without requiring login |
| 9 | Accounts | Register/login sets the session cookie and the UI reflects logged-in state without a page reload; `GET /account/orders` renders order history newest-first, paginated; attempting to view another customer's order via `/account/orders/:id` results in the same "not found" UI as a genuinely missing order (API returns `404`, not `403`) |
| 10 | Reduced motion | With `prefers-reduced-motion: reduce` set, the hero renders as a static reveal (no scroll-scrub animation); manually verified in at least one mobile browser with autoplay restricted |
| 11 | Security | Browser network tab, inspected during a manual QA pass, shows no request from the client carrying `X-API-Secret` |
| 12 | Data presentation | No raw UUID, snake_case/camelCase field name, or unformatted minor-units integer is visible anywhere in the rendered UI |

---

## 9. Open Questions

- Hero backdrop choice (Onyx Black vs. Bone White vs. neutral marble) — listed as an open decision in `docs/panache-central-website-reference.md` §7, still unresolved; needed before the Designer stage can finalize hero visuals. **Design stage will default to Onyx Black** (matches the primary palette role and the "closed presentation" beat's stated example) unless the operator overrides before hero asset production begins.
- Real shipping timelines/regions, return window, and care instructions — needed to replace the "Coming Soon" FAQ items; tracked as a follow-up PM ticket, not blocking this PRD's gate (see Waiver below).
- Flow AI hero footage production timeline — external dependency, not tracked in this PRD.

---

## 10. Definition of Ready — GATE

- [x] Problem statement is specific and falsifiable
- [x] At least one success metric is quantified with a baseline and target (Section 2)
- [x] Scope has explicit Out-of-Scope items
- [x] Every requirement has at least one acceptance criterion (Section 8)
- [x] Requirements are prioritized (Section 7, MoSCoW)
- [x] Risks section is non-empty (Section 6)
- [x] No placeholder text (`[TBD]`, `TODO`, `???`) remains in this document
- [x] File committed at `docs/pm/panache-central-website-prd.md`

### Waiver: Real trust/FAQ/legal content
**Reason:** Shipping timelines, return policy, care instructions, and legal text are operational facts owned by the business, not something to invent during this SDLC cycle — the brand guide explicitly warns against fabricating them.
**Owner:** Solo operator
**Revisit by:** Before public launch (must be resolved before the site goes live to real customers, not before this PRD's gate)
**Exposure restriction while open:** Affected sections render an explicit "Coming Soon" UI state, never fabricated content.

**Gate status: PASSED.** Ready to proceed to UI/UX Designer stage.

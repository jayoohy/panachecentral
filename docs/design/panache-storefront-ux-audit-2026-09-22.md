# Panache Central Storefront — UI/UX Audit

**Date:** September 22, 2026
**Reviewer role:** Senior UI/UX design review (heuristic + code-level audit)
**Method:** Full source read of every route under `app/`, every shared/commerce/layout component it composes, and the supporting design tokens (`app/globals.css`), copy constants, and hooks that drive state/loading/error behavior. No live browser render was available in this pass — findings that depend on rendered pixels (contrast, exact overlap) are flagged as **[Verify visually]**; everything else is confirmed directly against the implementation.
**Scope:** All 18 routes — Home, Shop, Shop/[category], Product/[slug], Cart, Checkout, Order Confirmation, Contact, About, Privacy, Terms, Account, Account/Orders, Account/Orders/[id], Login, Register, Forgot Password, Reset Password — plus the global chrome (Header, MobileNav, Footer, CartDrawer, QuickViewModal, Preloader).

**Resolution status (as of 2026-09-22, same day):** F1, F3, F4, F5, F6, F7, and F8
are fixed in code — see `docs/engineering/tickets/ux-audit-2026-09-22.md` for the
diff summary. F2 has real **draft** Privacy/Terms content now (replacing the
"Coming Soon" stub) but still needs actual legal review before the draft notice
on those pages is removed. The product gallery was also upgraded to a swipeable
carousel with a working thumbnail strip as part of the F3 fix, at the user's
request. Action-plan items 9–10 (below) remain open product conversations, not
code fixes.

---

## Overall Impression

This is an unusually disciplined codebase for a solo-built storefront. There's a real design system (locked onyx/gold/bone palette, a documented type/motion scale, `t-press`/`t-shake`/`t-badge-pop` transition tokens), and accessibility is clearly a first-class concern throughout — `aria-current`, `aria-pressed`, `aria-live`, `inert` on the collapsed mobile nav, focus return on drawer close, `prefers-reduced-motion` handling, icon+text status badges instead of color-only signaling. Most component-level code comments cite a design spec section, which means most of what looks like a "gap" below is actually a **documented, deliberate scope decision** (e.g., no toast on add-to-cart, no full category list in the footer). I've called those out separately from genuine gaps so the two don't get conflated.

The real issues cluster in four places: **mobile account discoverability**, **pre-purchase trust content** (policies, shipping/returns), **two product-page interactions that read as built but don't work** (image gallery, category-tile legibility), and **the seams around the WhatsApp checkout model**. None of these require a redesign — they're finishable within the existing system.

---

## Design Health Score — Nielsen's 10 Heuristics

| # | Heuristic | Score /4 | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Strong everywhere it's implemented (loading skeletons, `aria-busy`, badge pop, payment status polling) — see [F5](#f5-order-received-language-outruns-what-actually-happened-p1) for the one place status text overstates what's confirmed. |
| 2 | Match Between System & Real World | 4 | Luxury register held consistently; plain-language copy ("Sold out", "This option is currently unavailable"). |
| 3 | User Control and Freedom | 3 | Escape/backdrop-click closes drawers and modals everywhere; no "undo" on cart quantity changes, no way to cancel a placed WhatsApp order from the UI (relies on messaging the brand). |
| 4 | Consistency and Standards | 2 | [F1](#f1-account--orders-are-unreachable-from-the-mobile-nav-p0), [F6](#f6-required-field-indicators-are-inconsistent-across-forms-p2), and the Hero/FinalCta "Shop the Collection" label pointing at two different destinations all break the "same label, same place" contract. |
| 5 | Error Prevention | 3 | Out-of-stock variants are disabled *and* struck through *and* have screen-reader text — genuinely well done. Checkout doesn't confirm before sending an order into WhatsApp. |
| 6 | Recognition Rather Than Recall | 2 | No breadcrumbs anywhere (JSON-LD breadcrumbs exist for SEO but nothing visible), no visible "you are here" beyond nav underlines — a shopper who quick-views a product from page 3 of results has no way back to that exact spot. |
| 7 | Flexibility and Efficiency | 2 | No sort, no filter beyond category+search, no saved/recent search, no keyboard shortcuts — acceptable for a small catalog, worth reassessing as SKU count grows. |
| 8 | Aesthetic and Minimalist Design | 4 | The strongest dimension of the build. Flat, restrained, on-brand; no AI-slop tells (no gradient text, no glassmorphism, no generic card-grid dashboard feel). |
| 9 | Error Recovery | 3 | API errors surface real messages (`role="alert"`, shake animation); [F3](#f3-product-gallery-thumbnails-are-not-clickable-p1) and stale-cart recovery are handled well; no retry affordance on a hard network failure (e.g., shop grid) beyond a full reload. |
| 10 | Help and Documentation | 1 | [F2](#f2-privacy-and-terms-are-still-coming-soon-stubs-p0), no shipping/returns/exchange info anywhere pre-purchase, FAQ covers only material + ordering mechanics. |

**Total: 27/40 — Good, address the weak dimensions.** (Rating bands: 36-40 excellent, 28-35 good, 18-27 acceptable, 8-17 poor, 0-7 critical. This sits just under "good," pulled down almost entirely by Help/Documentation and Consistency.)

---

## Anti-Pattern / "Does this look AI-generated?" Verdict

**No.** This is the opposite of the usual tell set — no `#000`/`#fff`, no gradient text, no glassmorphism, no hero-metric template, no identical icon-card grids, no bounce/elastic easing, no side-stripe borders. The flat 0-radius Stitch system with label-caps typography and a single gold accent is a genuine, held-together point of view. This section exists to say clearly: **the visual craft is not the problem here.** The issues below are functional/informational completeness, not taste.

---

## Cross-Cutting Findings

These apply across multiple routes; page-by-page notes below reference these by ID instead of repeating them.

### F1. Account & Orders are unreachable from the mobile nav — P0
**Where:** [Header.tsx:76-84](components/layout/Header.tsx#L76-L84), [AccountMenu.tsx:32](components/layout/AccountMenu.tsx#L32), [AccountMenu.tsx:39](components/layout/AccountMenu.tsx#L39), [MobileNav.tsx:36](components/layout/MobileNav.tsx#L36)

`AccountMenu`'s login link and account dropdown are both classed `hidden ... sm:inline-flex` / `hidden sm:block` — invisible below the `sm` breakpoint (640px), i.e. on virtually every phone. `MobileNav`'s link list is built from `[{Home}, ...category links]` only; it never includes an account or login entry. Combined, **a shopper on a phone has no way to reach Login, My Account, or My Orders from anywhere in the primary navigation.** The only path in is the "Log in for faster checkout" link buried inside the checkout form — meaning a returning customer who wants to check an order status has to start a checkout to find the door.

*Why it matters:* mobile is the majority of storefront traffic for a jewelry brand selling through WhatsApp/social. This isn't a rough edge, it's a missing entry point to a whole app section.

*Fix:* add an Account/Orders (or Login, when signed out) item to `mobileLinks` in `Header.tsx`, or add a persistent account icon to the mobile header row instead of hiding it at `sm`.

### F2. Privacy and Terms are still "Coming Soon" stubs — P0
**Where:** [app/privacy/page.tsx](app/privacy/page.tsx), [app/terms/page.tsx](app/terms/page.tsx), [ComingSoonPage.tsx](components/shared/ComingSoonPage.tsx)

Both routes render a generic "This page is on its way" stub, `noindex`'d. They're linked from the footer on every single page. The storefront actively collects name, email, and phone at checkout and registration with no linked policy explaining what happens to that data, and no visible returns/exchange/shipping terms anywhere on the site — not even in the FAQ.

*Why it matters:* for a luxury-goods checkout that already asks a first-time buyer to hand over PII and then jump into WhatsApp to "confirm the order directly," the absence of a real privacy policy and sale terms is a trust gap at exactly the moment trust is most load-bearing. This also has a downstream compliance angle (data handling disclosure) that sits outside pure UX but is worth flagging alongside it.

*Fix:* at minimum, ship real Privacy and Terms content before the next traffic push; if genuinely blocked on legal copy, add a one-line "how we handle your order and info" section inline on checkout as an interim measure rather than leaving both fully absent.

### F3. Product gallery thumbnails are not clickable — P1
**Where:** [ProductDetailView.tsx:63-70](components/commerce/ProductDetailView.tsx#L63-L70)

The PDP renders `product.images[0]` as the large hero image and `product.images.slice(1)` as a 4-column thumbnail strip beneath it — but the thumbnails have no `onClick`, no button role, nothing. They render as inert `<img>` tags. A shopper sees four images of a piece of jewelry and can only actually view one of them at full size. For a category where people buy on visual detail (clasp, stone setting, texture), this reads as a broken feature, not a missing one — the affordance (a row of clickable-looking thumbnails) is present, the behavior isn't.

*Secondary issue in the same block:* thumbnail `alt=""` treats genuine content images (different angles/views of the product) as decorative. They should describe the view, e.g. `alt="${product.name} — view 2"`.

*Fix:* wire thumbnail clicks to swap the hero image (or open a lightbox), and give them real alt text.

### F4. Category tiles have no legibility guard against the photo behind the text — P1 [Verify visually]
**Where:** [CollectionSection.tsx:65-85](components/home/CollectionSection.tsx#L65-L85)

Each tile sets a category photo as an inline `background-image` and adds a `bg-blend-overlay` class — but `background-blend-mode` only does something when a `background-color` is also present on the same element, and none is set here. So the class is very likely a no-op, and the tile's label/price text sits directly on top of whatever the raw photo looks like, with no scrim, gradient, or `text-shadow`. Compare this to `Hero.tsx`, which solves the exact same problem (text over an unpredictable image) deliberately, with an explicit left-to-right gradient scrim *and* a text-shadow utility. The Collection tiles have neither.

*Why it matters:* this is the homepage's primary navigation into the catalog (`03 / The Collection`), and it's one bright product photo away from unreadable white-on-photo text — a real WCAG 1.4.3 contrast risk that the rest of the codebase is otherwise careful about.

*Fix:* add the same scrim/gradient treatment `Hero.tsx` already uses, or at minimum a `bg-onyx/40` (or similar) base layer for the blend mode to actually blend against.

### F5. "Order received" language outruns what actually happened — P1
**Where:** [CheckoutForm.tsx:46-53](components/commerce/CheckoutForm.tsx#L46-L53), [order-confirmation/page.tsx:79](app/order-confirmation/page.tsx#L79)

In WhatsApp checkout mode, the order record is created and the confirmation page says **"Thank you. We've received your order"** the instant `window.open` fires toward WhatsApp — before the shopper has typed or sent anything. If they close that WhatsApp tab, dismiss the popup, or the popup is blocked and they never notice the fallback link, the system has already told them "received" for an order the brand has no actual knowledge of yet.

*Why it matters:* this is a visibility-of-system-status mismatch at the single highest-stakes moment in the flow. It also risks a real backlog of "phantom" orders that were created but never followed up on WhatsApp, with no visible distinction in Account → Orders between "confirmed via WhatsApp" and "created but never confirmed."

*Fix:* soften the confirmation copy to something like "Almost done — confirm your order on WhatsApp to complete it," reserving "received" for after the WhatsApp thread is actually opened, or (better) after the brand acts on it.

### F6. Required-field indicators are inconsistent across forms — P2
**Where:** [CheckoutForm.tsx:140-172](components/commerce/CheckoutForm.tsx#L140-L172) vs. [app/account/register/page.tsx:24](app/account/register/page.tsx#L24)

Register marks its one optional field explicitly — `"Phone (optional)"`. Checkout's guest fields (Name, Email, Phone) show no required/optional cue at all in the label, even though Name is conditionally `required` and Email/Phone are not. A shopper can't tell, just by looking, which of the three checkout fields they're allowed to skip — they find out only after submitting.

*Fix:* apply the same `"(optional)"` convention checkout uses elsewhere in the app, or add a visible required marker to the two truly-required fields.

### F7. No sort, no visible breadcrumbs, no "back to results" continuity — P2
**Where:** [ShopView.tsx](components/commerce/ShopView.tsx), [ProductDetailView.tsx](components/commerce/ProductDetailView.tsx)

Shop only supports category filter + text search; there's no price/newest sort. JSON-LD breadcrumbs exist for SEO (`breadcrumbSchema`) but nothing renders visibly on category or product pages, so there's no on-page trail back to "Shop → Rings" from a product a shopper reached via search or a QuickView. Combined with pagination that doesn't scroll the viewport back to the top of the grid on page change, a shopper who pages to result 3 and clicks "Next" stays scrolled at the bottom, looking at the *old* set of products until they scroll up manually.

*Fix, roughly in order of impact:* scroll-to-grid-top on page change; a visible breadcrumb row mirroring the existing JSON-LD; sort as a later iteration once catalog size justifies it.

### F8. No branded 404 / error boundary — P2
**Where:** `app/` has no `not-found.tsx`, `error.tsx`, or `loading.tsx` at any level.

Every other "nothing here" state in the app (empty cart, empty search, empty orders, coming-soon page) has a deliberate, on-brand treatment. A mistyped URL or an uncaught render error falls through to Next.js's default page instead, breaking the otherwise consistent editorial-luxury tone at the exact moment a visitor is already slightly lost.

*Fix:* add `app/not-found.tsx` reusing the existing `EmptyState`/`ComingSoonPage` visual language, and a minimal `app/error.tsx` with a "Something went wrong, try again" affordance.

### F9. Add-to-cart confirmation is genuinely minimal by design — not a defect, flagging for awareness
**Where:** [AddToCartButton.tsx](components/commerce/AddToCartButton.tsx), [useQuickAddToCart.ts](hooks/useQuickAddToCart.ts)

This is explicitly documented as intentional ("no toast, no modal, lowest-overhead confirmation — design spec §5") and it's executed well: label swap + badge pop, nothing heavier. Noting it here only so it isn't mistaken for an oversight — it's a legitimate minimalist choice for this brand register, though worth a second look if data ever shows shoppers losing track of what's in their cart during a longer browsing session.

---

## Page-by-Page Notes

### Home (`/`)
Hero, Positioning, Benefits, Collection, FAQ, Final CTA — well-sequenced editorial narrative (numbered "01/02/03/04" kicker system reads as intentional, not decorative). Two things worth a look:
- Hero's CTA ("Shop the Collection" → `#collection` anchor) and Final CTA's button (same label → `/shop`) share identical copy for two different destinations. Minor, but it means the label alone doesn't reliably predict where a click goes ([Heuristic 4](#f4-category-tiles-have-no-legibility-guard-against-the-photo-behind-the-text-p1-verify-visually)-adjacent).
- FAQ has exactly two questions (material, how to order). For a jewelry purchase, shipping time, returns/exchanges, and sizing are the questions that actually block a first-time buyer — see [F2](#f2-privacy-and-terms-are-still-coming-soon-stubs-p0); this is the same gap surfacing on the homepage.
- Autoplaying hero video is muted, `playsInline`, and correctly suppressed under `prefers-reduced-motion` — this is handled properly.

### Shop (`/shop`) and Shop/[category]
Solid empty/loading/results states. Missing: sort, breadcrumbs, scroll-to-top on pagination — see [F7](#f7-no-sort-no-visible-breadcrumbs-no-back-to-results-continuity-p2). Category tile legibility risk ([F4](#f4-category-tiles-have-no-legibility-guard-against-the-photo-behind-the-text-p1-verify-visually)) applies here too via `CollectionSection`, not just the homepage.

### Product Detail (`/products/[slug]`)
Strong variant-selection UX (44px targets, disabled + struck-through + screen-reader text for out-of-stock combinations — genuinely above-average craft). The two real gaps: non-clickable gallery thumbnails ([F3](#f3-product-gallery-thumbnails-are-not-clickable-p1)), and no zoom/lightbox on the hero image, which for jewelry (stone clarity, clasp detail, engraving) is a bigger deal than for most product categories. No related/recommended products — plausibly a deliberate scope decision for a small catalog, but worth revisiting as SKU count grows.

### Cart (`/cart`) and Cart Drawer
The single shared `CartView` implementation (page + drawer) is the right call and avoids the classic "two carts drift apart" bug. Focus trap, Escape, scroll lock, and focus-return on close are all correctly implemented on the drawer. No issues found beyond the ones already listed above.

### Checkout (`/checkout`)
Functionally solid — redirects if the cart is empty, sensible loading state, real API error surfacing with a WhatsApp fallback link if something breaks. The findings that land here are [F5](#f5-order-received-language-outruns-what-actually-happened-p1) (status language) and [F6](#f6-required-field-indicators-are-inconsistent-across-forms-p2) (required-field marking). One more: nothing on this page mentions returns, exchanges, or how issues get resolved post-purchase — the highest-anxiety moment in the flow ("peak-end" territory) has no reassurance copy at all, which compounds [F2](#f2-privacy-and-terms-are-still-coming-soon-stubs-p0).

### Order Confirmation (`/order-confirmation`)
Good handling of the gateway-vs-WhatsApp branching and the popup-blocked fallback. Payment-status polling and the three failure/pending/success sub-states (paid/pending/failed) for the Paystack path are thorough. See [F5](#f5-order-received-language-outruns-what-actually-happened-p1) for the one real concern.

### Account, Account/Orders, Account/Orders/[id]
Clean, minimal, correctly redirect-guarded for logged-out visitors. Order history correctly shows a formatted reference instead of a raw ID (this codebase already follows the "no raw foreign keys" data-presentation convention well). The only issue is upstream: reaching any of these three pages from a phone in the first place — [F1](#f1-account--orders-are-unreachable-from-the-mobile-nav-p0).

### Login / Register / Forgot Password / Reset Password
The shared `AuthForm` shell is a good call — one implementation, four field sets, consistent error/shake treatment, `aria-invalid`/`aria-describedby` wired correctly. Reset Password correctly distinguishes "no token" from "token rejected by the API" with the same recovery CTA either way. No functional issues found; see [F6](#f6-required-field-indicators-are-inconsistent-across-forms-p2) for the one consistency note (Register does this well — Checkout doesn't match it).

### Contact (`/contact`)
Clear about the WhatsApp-first model up front ("The fastest way to reach us is WhatsApp"), which is exactly the kind of expectation-setting that's missing from Checkout. No issues found.

### About (`/about`)
Content is intentionally minimal per its own code comment ("no founding story, dates or numbers until real ones are supplied") — a scope decision, not a defect. The editorial numbered-section layout is well executed and reused correctly by `ContentPage`.

### Privacy / Terms (`/privacy`, `/terms`)
See [F2](#f2-privacy-and-terms-are-still-coming-soon-stubs-p0) — the most consequential finding in this audit.

---

## What's Working (keep doing this)

1. **Accessibility is a genuine first-class citizen, not an afterthought.** `aria-pressed` on variant pills, `aria-current` on nav, `inert` on the collapsed mobile menu, focus return on every drawer/modal close, icon+text (never color-alone) status communication, `prefers-reduced-motion` respected at the CSS level globally. This is meaningfully above the bar for a solo-built storefront.
2. **One implementation per pattern, reused everywhere.** Single `CartView` for page+drawer, single `AuthForm` for all four auth screens, single `EmptyState`, single `Button`. This is exactly the kind of architecture that keeps a design system from drifting, and it shows in how consistent the app feels.
3. **Error and loading states are treated as first-class design surfaces**, not bolted on — skeletons match the shape of the content they replace, `aria-busy`/`aria-live` are wired correctly, API errors are shown verbatim with a human recovery path (e.g., the WhatsApp fallback on checkout error).
4. **No AI-slop visual tells.** The flat, restrained, single-accent system is a real point of view, held consistently across every page reviewed.

---

## Recommended Action Plan

**Fix before next traffic push (P0):**
1. Add Account/Login to the mobile nav — [F1](#f1-account--orders-are-unreachable-from-the-mobile-nav-p0)
2. Ship real Privacy and Terms content, or an interim inline policy note on Checkout — [F2](#f2-privacy-and-terms-are-still-coming-soon-stubs-p0)

**Fix soon (P1):**
3. Wire product gallery thumbnail clicks + fix alt text — [F3](#f3-product-gallery-thumbnails-are-not-clickable-p1)
4. Add a scrim/gradient behind Collection tile text — [F4](#f4-category-tiles-have-no-legibility-guard-against-the-photo-behind-the-text-p1-verify-visually)
5. Soften "order received" copy to match what's actually confirmed at that point — [F5](#f5-order-received-language-outruns-what-actually-happened-p1)

**Next pass (P2):**
6. Consistent required/optional field marking across all forms — [F6](#f6-required-field-indicators-are-inconsistent-across-forms-p2)
7. Scroll-to-top on pagination; visible breadcrumbs; sort (once catalog size justifies it) — [F7](#f7-no-sort-no-visible-breadcrumbs-no-back-to-results-continuity-p2)
8. Branded `not-found.tsx` / `error.tsx` — [F8](#f8-no-branded-404--error-boundary-p2)

**Worth a product conversation, not a code fix:**
9. Whether "received" should require a WhatsApp thread actually being opened before an order is treated as confirmed anywhere in Account → Orders (ties to F5 and to how backend order status is modeled — flagging for the next PM/engineering pass rather than prescribing the fix here).
10. Expand the FAQ / add a shipping-and-returns section once real policy content exists (depends on F2).

# Engineering Ticket: product-card-hover-image

**What changed:**
- `components/commerce/ProductCardImage.tsx` (new) — lead image + optional
  alternate image layered absolutely, opacity swap on `group-hover` /
  `group-focus-within`; owns the "No image" placeholder previously inline in
  the card.
- `components/commerce/ProductCard.tsx` — renders `ProductCardImage`.
- `lib/duka/types.ts` — `ProductSummary.images: string[]` (§5.2).

**Test added or updated:** None automated — the project's Vitest setup has no
DOM/component environment, and the behaviour is CSS-state only. Verified
`tsc --noEmit` and ESLint clean. Pre-existing unrelated failure:
`lib/format-order-status.test.ts` expects "Payment Confirmed" but the
formatter returns "Confirmed" (fails on main before this change).

**Changelog:** Product cards now reveal a second product photo on hover/focus.

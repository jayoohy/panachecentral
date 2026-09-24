# Design Ticket: product-card-hover-image

**What's changing:** The card photograph cross-fades (700ms, matching the
existing 1.03 zoom timing) to the product's second image while the card is
hovered or focused.

**Affected screens/states:** `ProductCard` on /shop and /shop/[category],
default and hover/focus states. Empty (no image) state unchanged; single-image
products keep the zoom only.

**Before/after:** Before — hover zooms the lead image. After — hover zooms and
reveals the alternate angle.

**Accessibility check:** No change to contrast, touch targets or focus order.
Second image has `alt=""`/`aria-hidden`. Transition disabled under
`prefers-reduced-motion` (swap is instant). Hover state gated to
`(hover: hover)` devices by Tailwind v4's `group-hover`.

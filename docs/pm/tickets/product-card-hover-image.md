# Ticket: product-card-hover-image

**Change:** Product cards (shop grid, category grids) cross-fade from the lead
image to the product's second image on hover or keyboard focus. Products with
one image (or none) keep today's behaviour.

**Why:** Owner request (2026-09-24). The list endpoint now returns every
product image (`docs/storefront-api.md` §5.2 `images`), so a second angle can
be shown without a detail call.

**Acceptance Criteria:**
- On a hover-capable device, hovering a card whose product has 2+ images shows
  the second image; moving away restores the lead image.
- Tabbing into a card (its link or buttons) shows the second image too.
- A product with 0 or 1 image renders exactly as before (no blank flash).
- On touch devices a tap never leaves the card stuck on the second image.
- The second image is not announced by screen readers (decorative duplicate).

**Risk flag:** No. Presentation-only; reads an existing API field.
Design stage NOT skipped (visual change) — see docs/design/tickets/product-card-hover-image.md.

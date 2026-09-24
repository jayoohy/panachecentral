# Design Spec: Storefront API Readiness — Checkout Fulfilment & Product Rails

**Track:** A · **PRD:** `docs/pm/storefront-api-readiness-prd.md` · **Date:** 2026-09-24
Visual language: existing Stitch system (Onyx/Bone/Gold, 0px radius, hairline fields, label-caps). See `docs/design/panache-storefront-design-spec.md`.

## 1. Traceability Map
| PRD req | Screen / flow |
|---|---|
| R1 | /checkout → "How would you like to receive it?" choice (Flow A) |
| R2 | /checkout → Delivery address fields |
| R3 | /checkout → Pickup location list |
| R4 | /checkout → Order Summary panel delivery line + total |
| R5 | /order-confirmation → "Delivery" / "Pickup" block |
| R6, R7 | / (home) → Featured, New Arrivals, Best Sellers rails (Flow B) |

## 2. User Flows
**Flow A: checkout.** Cart → Checkout → store options load → shopper picks Delivery or Pickup (preselected if only one) → fills address / picks location → summary updates the fee and total → Place Order → confirmation (or WhatsApp / gateway, unchanged).
- Alt 1: store options fail to load → error with "Try again" and a WhatsApp link; Place Order disabled.
- Alt 2: neither option enabled → message; Place Order disabled.
- Alt 3: API rejects (e.g. pickup location withdrawn) → the API's shopper-facing message shown above the button; the form keeps its values.

**Flow B: home rails.** Home → scroll → rail heading + row of cards → swipe/drag or press Next → card → product page. "View all" → /shop.
- Alt: rail loading → 4 skeleton tiles; rail empty/errored → rail not rendered.

## 3. Screen & State Inventory
**Checkout: fulfilment block**
| State | Behaviour |
|---|---|
| Loading | Two skeleton bars in place of the choice |
| Default | Radio cards "Delivery" / "Pickup"; description line under each |
| Empty | Neither enabled → "This store isn't taking online orders right now." |
| Error | "We couldn't load delivery options." + Try again + WhatsApp |
| Success | Choice made; relevant fields shown; summary updated |
| Pickup, no locations | "No pickup locations are available right now. Please choose delivery." |

**Order Summary panel:** adds "Delivery" row (fee / "Free") or the note under the totals. N/A for loading (panel only renders with data).

**Order confirmation: fulfilment block:** Default only (renders with the order); N/A for older orders with `fulfilmentMethod: null` (block hidden).

**Home rail**
| State | Behaviour |
|---|---|
| Loading | Kicker + heading + 4 skeleton tiles |
| Empty / Error | Nothing rendered (R7) |
| Default | Row of cards; prev disabled at start |
| End | Next disabled |

## 4. Information Architecture
No new routes. Checkout gains one section between contact details and the error/submit area. Home order: Hero · 01 House · **Featured ("The Edit")** · 02 Pillars · 03 Collection · **New Arrivals** · **Best Sellers** · 04 Questions · Final CTA. Rail kickers are unnumbered (like the Hero's), so a hidden rail leaves no gap in the 01–04 sequence.

## 5. Component Inventory
| Component | Tag | Note |
|---|---|---|
| Button, Section, SectionHeading, SectionKicker, Reveal, FIELD_CLASS | [REUSE] | |
| ProductCard (+ ProductCardImage) | [REUSE] | Rails reuse the grid card |
| OrderSummaryPanel | [REUSE] | Gains optional delivery row |
| RadioCard | [NEW] | Bordered radio card used for the method choice and pickup list; no existing radio pattern |
| FulfilmentSection | [NEW] | Wraps the choice with its loading/error/empty states |
| CheckoutField | [NEW] | Extracted from CheckoutForm's inline field so address fields reuse it |
| DeliveryAddressFields | [NEW] | Address group incl. state select; no select field exists yet |
| PickupLocationList | [NEW] | Radio list of locations |
| FulfilmentDetails | [NEW] | Read-only block on confirmation |
| ProductRail | [NEW] | Horizontal scroll-snap row + arrow buttons; the gallery carousel is single-image, not a multi-card row |
| ProductRailSection | [NEW] | Home band wrapping a rail with heading and "View all" |

## 6. Responsive Behaviour
- **Rails:** card width 78% (<640px, next card peeks), 45% (640–1023px), 25% minus gaps (≥1024px). Arrow buttons hidden below 640px (swipe is the control); shown ≥640px next to "View all".
- **Checkout:** single column below lg as today; City/State side by side ≥640px.

## 7. Accessibility (WCAG 2.1 AA)
- Fulfilment choice is a native `radio` group inside `<fieldset>` + `<legend>`; the whole card is the `<label>` (≥44px tall).
- State `<select>` has a visible label; required fields use native `required`; optional ones say "(optional)" (same mechanism as F6).
- Rail: `<section aria-labelledby>` on the heading; scroller is a `<ul>` of `<li>` cards; prev/next are `<button aria-label="Previous — New Arrivals">`, 44×44px, `disabled` at ends. Scroller is focusable (`tabIndex=0`) so arrow keys scroll it natively.
- `prefers-reduced-motion`: `scroll-behavior: auto` (no smooth scroll).
- Contrast: all text uses existing tokens verified in the site design spec §9.6.

## 8. Microcopy
| Where | Copy |
|---|---|
| Fulfilment legend | How would you like to receive it? |
| Delivery option | Delivery: "We'll bring it to your address." |
| Pickup option | Pickup: "Collect it from one of our locations." |
| Address labels | Recipient name · Phone · Address · City · State · Landmark (optional) |
| State placeholder | Choose a state |
| Loading error | We couldn't load delivery options. Try again, or message us on WhatsApp. |
| Neither enabled | This store isn't taking online orders right now. |
| No pickup locations | No pickup locations are available right now. Please choose delivery. |
| Summary fee | Delivery · ₦X / Free |
| Summary note | Delivery: {merchant note} |
| Confirmation heading | Delivery / Pickup |
| Rail: featured | Kicker "The Edit" · Heading "Chosen *This Season*" |
| Rail: newest | Kicker "Just In" · Heading "New *Arrivals*" |
| Rail: best selling | Kicker "Most Loved" · Heading "Best *Sellers*" |
| Rail link | View all → |

## 9. Design Acceptance Criteria
- Choosing Delivery/Pickup swaps the field group and summary line within the same frame (no network wait).
- On a 375px viewport, the second rail card is visibly peeking (≥15% of its width on screen).
- One press of Next moves the rail by the number of fully visible cards; at the last card Next is disabled.
- A rail with zero products produces no DOM output (verifiable in the inspector).
- Every checkout field is reachable by Tab in visual order: contact → choice → address/location → submit.

## 10. Definition of Ready — Gate Check
- [x] Every Must/Should PRD requirement has a Traceability row
- [x] Every screen has default/loading/empty/error/success (or N/A with reason)
- [x] No placeholder microcopy
- [x] Every component tagged [REUSE]/[NEW]
- [x] Accessibility requirements are specific
- [x] Responsive behaviour specified
- [x] Design acceptance criteria testable by someone else
- [ ] Committed: pending the owner's commit

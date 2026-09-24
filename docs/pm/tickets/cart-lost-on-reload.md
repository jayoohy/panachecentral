# Ticket: cart-lost-on-reload

**Change:** `useCart` no longer creates a new cart on every full page load. It
reads the persisted cart id from the live store instead of from the hydration
render.

**Why:** Found 2026-09-24 while testing checkout. React's hydration render uses
the Zustand store's initial snapshot (`cartId: null`), so `useCart`'s effect
created a fresh, empty cart before the saved id applied. Any reload, typed URL
or new tab lost the shopper's cart. Refreshing /checkout bounced shoppers to an
empty cart.

**Acceptance Criteria:**
- Loading /shop, /shop, /cart, /checkout as separate full page loads keeps one
  cart id in `localStorage["panache-storefront"]` throughout.
- A first-time visitor (no stored id) still gets exactly one cart created.
- A stale/404 cart id is still replaced (existing behaviour).

**Risk flag:** No. One-line client fix; no API, auth or data change.
`design_stage: skipped — no UI impact`

---

**Engineering:** `hooks/useCart.ts`: the create-cart effect checks
`useCartStore.getState().cartId`. Test: no DOM test harness exists (see
`docs/engineering/storefront-api-readiness-impl-notes.md` Waiver). Verified in
headless Chrome across four full page loads: same id before and after the fix
(before: four different ids). Changelog: "Your cart is kept when you reload or
open the store in a new tab."

**Security:** No sensitive surface: client state only; no auth, secrets,
external input, integrations or infra. No dependency change.

**Growth:** Likely positive effect on add-to-cart → checkout, but not measurable
without analytics. Note it as a confound if order volume moves after this
deploy.

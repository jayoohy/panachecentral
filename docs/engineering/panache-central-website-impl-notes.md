# Implementation Notes — Panache Central Storefront

**Track:** A
**Source PRD:** `docs/pm/panache-central-website-prd.md`
**Source design spec:** `docs/design/panache-central-website-design-spec.md`
**Status:** In progress — first increment shipped (homepage + site shell). Catalogue, cart,
checkout, and accounts are **not started**, blocked on the Duka Storefront API `X-API-Key`/
`X-API-Secret` (operator to provide once the design is confirmed, per PRD §5). This document
does **not** claim the full Track A Definition of Done (Section 5 below is scoped to what
this increment actually covers).

---

## 1. Technical Design Summary

### What shipped this increment
- Tailwind v4 theme tokens for the locked brand palette (Onyx Black, Champagne Gold, Bone
  White, Deep Bronze) and two typefaces (Playfair Display for serif headlines, Inter for
  body/nav/buttons) — `app/globals.css`, `app/layout.tsx`.
- Site shell: `components/layout/Header.tsx`, `components/layout/Footer.tsx`, matching the
  design spec's IA (§4).
- Homepage, all 9 sections from `docs/panache-central-homepage-content.md`, each its own
  component under `components/home/`, composed in `app/page.tsx`.
- Hero scroll-reveal sequence (`components/home/HeroScrollSequence.tsx` +
  `hooks/useHeroFrameSequence.ts`, `hooks/useReducedMotion.ts`) against the 240 JPEG frames
  already extracted to `public/clips/` — a tall scroll track with a native `position: sticky`
  pinned frame, no animation library. Reduced-motion fallback shows the payoff frame
  statically with no scroll binding, per design spec §3.1.
- Shared "Coming Soon" primitives (`components/shared/ComingSoonPage.tsx`,
  `ComingSoonInline.tsx`) per design spec §3.11, used for the six footer Company/Legal
  routes (`/about`, `/care-materials`, `/contact`, `/privacy`, `/terms`,
  `/shipping-returns`), the homepage Trust section, and the three unanswered FAQ items.
- Contrast ratios required by design spec §9.6 measured and recorded directly in that file
  (Champagne Gold/Onyx 8.25:1, Bone/Onyx 17.59:1, Deep Bronze/Bone 4.44:1, Onyx/Bone 17.59:1).

### Not started this increment (needs the API key)
Category listing, product detail, cart, checkout, order confirmation, and customer accounts
— all of PRD §3's remaining Must/Should scope. The header's cart and account icons render
inert (grey, `title` tooltip, no click target) rather than link to routes that don't exist
yet; category nav links and footer "Shop" links point at the homepage's `#collection` anchor
instead of per-category routes. All three are marked with a `ponytail:` comment in
`components/layout/Header.tsx` pointing at what to replace once the catalogue work starts.

### Deviations from the source docs (flagged, not silent)
1. **Footer tagline text.** `docs/panache-central-homepage-content.md` §9 drafts the footer
   line as "Panache Central. Jewelry, Not Trends." — the *other* brand-approved tagline. The
   PRD (`docs/pm/panache-central-website-prd.md` §3, Acceptance Criteria #1) explicitly locks
   "Fine Jewelry. Made to Last." sitewide and names the footer line as one of the three places
   it must appear. This build follows the PRD's explicit lock over the content doc's literal
   draft text, on the read that the content doc predates the tagline decision. Worth an
   explicit operator confirmation.
2. **Hero text scrim.** Not specified in the design spec. Visual QA against the real
   extracted frames (see §2) showed the headline/subhead losing legibility over the box's own
   gold foil logo and the bright reveal-beat frames. Added a radial scrim + text-shadow behind
   the hero copy (`components/home/Hero.tsx`) so contrast holds regardless of which frame is
   showing. This is a legibility fix, not a copy or layout change.
3. **Category teaser cards.** `docs/panache-central-homepage-content.md` §5 marks the
   per-category one-liners as "pending category-specific copy" — not written. Cards render
   the category name only; no line was invented to fill the space.
4. **`public/logo/*` favicon assets not adopted.** The existing `site.webmanifest` in that
   folder is a generic favicon-generator placeholder (`"name": "MyWebSite"`), not brand-locked
   PC-monogram output — left the default Next.js favicon in place rather than wire in
   mismatched branding. Flagging for the operator to supply the real monogram favicon.

## 2. Test Plan & Coverage

No automated test framework is installed in this project yet (`package.json` has none). For
this increment — static content plus one small piece of scroll-position math — verification
was:
- `npx tsc --noEmit` — clean.
- `npx eslint .` — clean (see fixes below).
- `npx next build` — production build succeeds, all shipped routes prerender as static.
- Visual QA: rendered the homepage in a real browser (`pixelshot`) and read every section
  top to bottom, confirming copy matches the content doc verbatim, section tones alternate
  as specified, and the scroll-scrub sequence actually pins and advances through real frames
  (closed box → opening → reveal) rather than just compiling.
- Accessibility contrast: computed via the WCAG relative-luminance formula (Node one-liner),
  recorded in the design spec (§9.6).

The frame-index calculation in `useHeroFrameSequence` is a single clamped linear
interpolation (`ponytail`: trivial one-liner, not given a dedicated test per the workspace's
"no test needed for trivial one-liners" rule). Once cart/checkout logic lands (coupon math,
stock checks, quantity-as-set semantics), those get real unit tests — that logic is not
trivial.

Lint fixes applied during self-review: internal `#collection` links switched from `<a>` to
`next/link` (`no-html-link-for-pages`); `useReducedMotion` rewritten with
`useSyncExternalStore` instead of `useState`+`useEffect` (avoids the `set-state-in-effect`
render-cascade warning); `useHeroFrameSequence`'s preload function wrapped in `useCallback`
to satisfy `exhaustive-deps`. The two `no-img-element` warnings on the hero frames are
suppressed inline with a comment explaining why (`next/image` doesn't fit 240
imperatively-swapped frames) — everything else is warning/error-free.

## 3. Baseline Security Hygiene

No secrets, no network calls, and no user input exist in this increment — the homepage and
Coming Soon stubs are fully static. Nothing to audit yet on that front. When catalogue/cart
work starts, the PRD's security requirement (§4.2) applies from the first line of code: all
Duka Storefront API calls go through Next.js server-side route handlers, `X-API-Key`/
`X-API-Secret` read from server-only env vars, never shipped to the browser.

## 4. Documentation Updates

- `docs/design/panache-central-website-design-spec.md` §9.6 updated with the measured
  contrast ratios (previously an open verification item).
- This file created.

## 5. Definition of Done — scoped to this increment

- [x] Homepage's 9 sections implemented, copy verbatim against the locked content doc
      (except the flagged footer-tagline deviation above)
- [x] Typecheck, lint, and production build all pass clean
- [x] No hardcoded secrets (none exist yet — no API integration in this increment)
- [x] No unresolved `TODO`/`FIXME` — the three deferred header links are `ponytail:`-commented
      with what unblocks them (the API key), not silent
- [ ] **Not claimed:** full Track A Definition of Done from
      `.claude/rules/software-engineer.md` §5 — category/cart/checkout/account acceptance
      criteria (PRD §8, items 2–9, 11) are unbuilt, not failing; they haven't started

### Waiver: Full Definition of Done
**Reason:** Catalogue, cart, checkout, and account acceptance criteria all require a live
Duka tenant to build and test against meaningfully. The operator is providing the
`X-API-Key`/`X-API-Secret` once the design is confirmed (this session's brief), so this is a
sequencing gap, not a skipped step.
**Owner:** Solo operator
**Revisit by:** Once the Storefront API credentials are available — resume with category
listing pages (`GET /catalogue/categories` + `GET /catalogue/products`), which is the next
item in PRD §7's Must list that this increment didn't reach.

**Gate status: PARTIAL.** Homepage + shell increment is done and self-reviewed. Not
proceeding to the Security Engineer stage yet — that stage's attack-surface review is
meaningless before there's any attack surface (no API calls, no auth, no data yet).

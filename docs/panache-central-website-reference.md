# Panache Central — Website Reference

Aligned to Brand Identity Guide v1.0 (Permanent). Where this document and any earlier packaging/website notes conflict, the Brand Identity Guide wins.

---

## 1. Purpose

This is the working reference for panachecentral's website — visual system, hero concept, and technical approach — pulled from the locked brand guide plus the scroll-reveal concept already agreed on. Nothing here introduces new colors, logos, or voice; it applies the guide to the specific medium of the website.

---

## 2. Design System (from the Brand Guide)

**Palette — locked, no exceptions:**

| Role           | Color   | Site usage                                                                |
| -------------- | ------- | ------------------------------------------------------------------------- |
| Onyx Black     | #0A0A0A | Page backgrounds, primary text, hero backdrop                             |
| Champagne Gold | #C9A24B | Logo, CTA buttons/links, accent lines, foil-style highlight details       |
| Bone White     | #F5F1EA | Secondary background sections, negative space, light-mode contrast blocks |
| Deep Bronze    | #8A6A3B | Shadows, depth, secondary text on Bone White sections                     |

No pink, no pastel, no seasonal recoloring — every product line (steel, moissanite, gold, future diamonds) uses this same palette.

**Logo usage on site:**

- Primary: serif wordmark "Panache Central," full name, never abbreviated in customer-facing UI (header, footer, page titles).
- Secondary: PC monogram — used for favicon, browser tab icon, small social-share marks, and loading-state marks. Never used as the main header logo.
- Minimum clear space around the logo = height of the letter "P." Logo never appears over a photo or patterned background — always on a solid Onyx Black or Bone White field.

**Typography:**

- Headlines/section titles: the serif logo typeface family, letter-spaced, used sparingly (all caps for section headers is fine, not for body copy).
- Body copy, product descriptions, nav, buttons: clean sans-serif (Helvetica Neue / Inter / Futura).
- Never more than two typefaces on any single page.

**Photography/motion backdrop rule (carries directly into the hero sequence below):** solid Onyx Black, Bone White, or neutral stone/marble only — never a busy or colorful backdrop. Soft, directional jewelry-style lighting that catches metal and stone shine — never flat ring-light/selfie lighting.

---

## 3. Hero Concept — Scroll-Reveal Sequence

Same three-beat structure agreed on earlier, restyled to the locked system (no wax seal, no kraft paper, no twine — the brand guide's packaging language is Onyx Black box/pouch, Champagne Gold foil, Bone White lining):

1. **Closed presentation** — an Onyx Black box or cloth pouch, Champagne Gold foil PC monogram visible, resting on a solid Onyx Black or neutral marble surface. Camera locked off, no movement.
2. **Scroll opens it** — lid lifts or pouch opens in one clean motion, Bone White interior lining visible, the piece revealed resting inside, softly lit to catch the metal/stone shine.
3. **Scroll continues, piece transitions onto the body** — a ring slides onto a finger, a necklace settles onto a neck, an earring clicks onto an ear, depending on the category. This is the payoff frame — the product, worn, well lit against a solid neutral backdrop.

**Repeats as a pattern**, not a one-time hero — each featured product gets this same three-beat pinned section going down the homepage, so the page reads as one consistent system rather than a single gimmick moment.

---

## 4. Cross-Clip Consistency Requirements

Since every "box → reveal → wear" section needs to feel like one continuous brand system rather than stitched-together unrelated clips, every generated sequence must match on:

- Same backdrop choice (Onyx Black, Bone White, or the same neutral marble — picked once, used everywhere)
- Same camera framing and locked-off angle, no camera movement (movement is where AI-generated video tends to warp/flicker)
- Same lighting direction and quality across every clip
- Same clip length/pacing, so scroll speed feels uniform section to section
- Champagne Gold foil detail visible and consistent in every closed-box frame

---

## 5. On-Site Copy Standards

Pulled directly from the guide's voice principles — applies to hero headlines, product captions, and CTAs:

- Confident, not salesy. No stacked emoji, minimal exclamation points.
- Short sentences — don't over-explain a piece, describe it and how it's worn.
- No discount-forward language ("SALE," "cheap," "affordable") — frame around craft, material, and longevity instead.
- Approved tagline (pick one, use consistently sitewide): **"Fine Jewelry. Made to Last."** or **"Panache Central — Jewelry, Not Trends."**

---

## 6. Technical Approach

- **Pattern:** scroll-scrubbed canvas image sequence — the scrollbar acts as the playhead, not a fixed-playback video (the Apple product-page technique). Frame-accurate scrubbing in both directions, avoids video-seek jank.
- **Source footage:** generated via Flow AI, then frame-extracted for the canvas sequence.
- **Key risk:** AI-generated video shows more frame-to-frame flicker than real footage, and slow scroll-scrubbing exposes that more than normal playback. Generate and fully scroll-test one clip before committing to the full set.
- **Build order:** asset pipeline (generate → extract → compress to WebP) before any scroll-binding code; static render of frame 0 first to isolate rendering bugs from scroll-logic bugs; then wire GSAP ScrollTrigger; then mobile/fallback pass (reduced motion, autoplay restrictions) as a required step, not polish.

---

## 7. Open Decisions — Website Specific

- [ ] Confirm backdrop choice for the hero sequence: Onyx Black, Bone White, or neutral marble (pick one, use across all product clips)
- [ ] Draft Flow AI prompts — one shared box/reveal template + one variant per category (ring→hand, necklace→neck, earring→ear), written to lock camera/lighting/staging per the consistency rules above
- [ ] Decide which tagline is used sitewide

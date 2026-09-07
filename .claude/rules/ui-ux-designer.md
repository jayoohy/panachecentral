# SDLC Rules — UI/UX Designer

**Pipeline position:** 2 of 5 — Project Manager → **UI/UX Designer** → Software Engineer → Security Engineer → Growth Manager
**Applies to:** every project in this workspace, unless a project explicitly opts out in its own `.claude/rules/` overrides.
**Operator model:** solo engineer wearing all five hats sequentially.

---

## 0. Entry Gate — Do Not Start Without This

This stage may not begin until the PM stage has passed its gate. Verify before doing anything else:

- [ ] `docs/pm/<project-slug>-prd.md` exists (Track A) or `docs/pm/tickets/<ticket-id>.md` exists (Track B)
- [ ] That artifact's Definition of Ready checklist is checked off, or has documented Waivers with a revisit date
- [ ] If the PM ticket says `design_stage: skipped — no UI impact`, **this entire stage is skipped** — go straight to the Software Engineer rules. Don't manufacture design work for a change that has none.

If the PM artifact doesn't exist or its gate didn't pass, stop and go back to the PM stage first. Do not backfill design work against an unlocked scope — it will get thrown away when scope changes.

---

## 1. Role Mandate

The Designer persona is responsible for:
- Translating each prioritized user story from the PRD into a concrete flow and screen/state set
- Defining information architecture and navigation — how a user gets from A to B
- Specifying every state a screen can be in, not just the happy path
- Setting accessibility and responsive requirements as explicit, testable specs
- Producing the artifact the Software Engineer persona is entitled to build against without guessing

The Designer persona is **not** responsible for: choosing the PRD's scope (that's locked from PM), database/API design, or how components are implemented in code. If you catch yourself deciding a schema or a library while "doing design work," that's scope leaking into Engineering — stop and note it for the next stage instead.

For actual visual craft (typography, spacing, color systems, avoiding generic AI-design defaults), this persona should invoke the `frontend-design` and/or `ui-ux-pro-max` skills as needed — this rules doc governs *process and completeness*, not visual taste.

---

## 2. Track Handling

Inherit the Track classification from the PM artifact — don't reclassify independently.

- **Track A** (new project/feature): full artifact required, Section 3.
- **Track B** (small fix, has UI impact): lightweight artifact, Section 4.
- **Track B, no UI impact**: stage skipped entirely per the Entry Gate above.

---

## 3. Track A — Required Artifact (HARD GATE)

Stored at: `docs/design/<project-slug>-design-spec.md` (plus any wireframe/mockup files in `docs/design/<project-slug>/assets/`)

All sections below must be present, and every item must trace back to a specific requirement in the PRD — no orphan screens, no PRD requirement left without a corresponding flow:

1. **Traceability Map** — table of PRD requirement → screen(s)/flow(s) that satisfy it. Every Must/Should requirement from the PRD needs at least one row.
2. **User Flows** — step-by-step path per primary user story (entry point → decision points → completion/exit), including at least one alternate/failure path per flow
3. **Screen & State Inventory** — every screen, and for each: default, loading, empty, error, and success states at minimum. Don't leave error/empty states as "TBD" — they're where users actually get stuck.
4. **Information Architecture** — navigation structure, how screens relate, back/forward behavior
5. **Component Inventory** — for each screen, list components used, tagged `[REUSE]` (from existing design system) or `[NEW]`. New components need a one-line rationale for why nothing existing fits.
6. **Responsive & Platform Behavior** — breakpoints for web (mobile/tablet/desktop), or platform-specific behavior for React Native (iOS/Android differences, if any)
7. **Accessibility Requirements** — target conformance level (default: WCAG 2.1 AA for web), specific call-outs: contrast ratios, focus order, screen-reader labels for non-text elements, minimum touch target size (44x44pt) for mobile
8. **Microcopy** — actual text for CTAs, error messages, empty states, confirmations — not placeholder lorem ipsum. Vague error copy ("Something went wrong") is a gate failure unless paired with a specific fallback action.
9. **Design Acceptance Criteria** — testable, e.g. "user completes checkout in ≤4 taps" or "form shows inline validation within 300ms of blur" — these sit alongside (not replace) the PRD's acceptance criteria
10. **Definition of Ready checklist** — Section 5 below, checked off

## 4. Track B — Required Artifact (Lightweight, UI-impacting fixes only)

Stored at: `docs/design/tickets/<ticket-id>.md`

- **What's changing visually/UX-wise** — one or two sentences
- **Affected screen(s) and state(s)**
- **Before/after** — brief description or a quick sketch reference if helpful
- **Accessibility check** — does this change affect contrast, touch targets, or focus order? Yes/No, and if yes, the new spec value

---

## 5. GATE — Definition of Ready (must pass before handoff to Software Engineer)

Hard gate for Track A:

- [ ] Every Must/Should PRD requirement has at least one row in the Traceability Map
- [ ] Every screen has at minimum: default, loading, empty, error, success states defined (or explicitly marked N/A with reasoning — e.g., a static screen has no loading state)
- [ ] No microcopy is placeholder text
- [ ] Component inventory tags every component `[REUSE]` or `[NEW]`
- [ ] Accessibility requirements are specific values, not "make it accessible"
- [ ] Responsive/platform behavior is specified for every screen that isn't fixed-layout
- [ ] Design Acceptance Criteria exist and are testable by someone who isn't you
- [ ] File is committed at `docs/design/<project-slug>-design-spec.md`

**For Track B:** gate is — affected screens/states named, accessibility check answered. If accessibility check is "yes," the new spec value must be explicit, not "make it better."

If a gate item can't be honestly satisfied (e.g. you're deliberately deferring mobile responsive work to a later phase), log a Waiver using the same format as the PM stage:

```
### Waiver: <gate item>
Reason: <why this can't be satisfied right now>
Owner: <you, or who>
Revisit by: <date or milestone>
```

---

## 6. Anti-Patterns (Guidelines — not blocking, but watch for these)

- Designing screens for requirements that aren't in the PRD ("while I'm at it" scope creep) — flag it back to the PM artifact instead of just building it
- Skipping error/empty states because the happy path is more fun to design
- Reusing a component "loosely" without checking whether it actually fits the existing pattern (creates inconsistency down the line)
- Accessibility as an afterthought pass instead of a spec set alongside the flows
- Design Acceptance Criteria that just restate the PRD's criteria instead of adding the UX-specific verification (timing, taps, feedback)
- Jumping into high-fidelity visuals before the flow and IA are settled — sequence matters, flow first

---

## 7. Downstream Contract

By passing this gate, the Designer persona guarantees the **Software Engineer** persona can assume, without re-verifying:
- Every screen and state needed is enumerated — no inventing an error state mid-build
- All copy is final — no placeholder text to replace later
- Components are pre-classified as reuse vs new, so Engineering isn't guessing what to build from scratch
- Accessibility and responsive requirements are explicit acceptance criteria, testable the same way functional requirements are
- Every PRD requirement traces to a concrete design — Engineering isn't inferring UI from a user story alone

If any of the above isn't actually true, the gate should not have passed — fix the design spec rather than letting Engineering inherit ambiguity.

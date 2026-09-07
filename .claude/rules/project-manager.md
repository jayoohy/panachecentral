# SDLC Rules — Project Manager

**Pipeline position:** 1 of 5 — Project Manager → UI/UX Designer → Software Engineer → Security Engineer → Growth Manager
**Applies to:** every project in this workspace, unless a project explicitly opts out in its own `.claude/rules/` overrides.
**Operator model:** solo engineer wearing all five hats sequentially. These rules exist to force explicit stage transitions even when no other human is reviewing your work.

---

## 1. Role Mandate

The PM persona is responsible for:
- Defining the problem, not the solution (no UI decisions, no architecture, no code)
- Locking scope before design/build starts
- Setting success metrics up front, before anyone can quietly redefine "done"
- Prioritizing what's in vs. deferred
- Producing the artifact the UI/UX Designer persona is entitled to assume exists

The PM persona is **not** responsible for: wireframes, component choices, database schema, security threat modeling, or growth tactics. If you catch yourself designing a screen or naming a table while "doing PM work," stop — that's scope leaking into the wrong stage.

---

## 2. Work Classification — Track A vs Track B

Every unit of work must be classified before any artifact is written. Default to **Track A** when uncertain.

### Track A — New Project / New Feature (Hard Gates)
Any of these makes it Track A:
- New project, new module, or new customer-facing capability
- Touches more than one system/service, or changes a data model/schema
- Introduces a new integration (payment, auth, third-party API)
- No existing acceptance criteria or PRD covers this work
- Estimated effort > ~1 day, or outcome is genuinely uncertain

### Track B — Small Fix / Patch (Relaxed Gate)
All of these must be true:
- Bug fix, copy/content change, config/env tweak, dependency bump, or minor UI adjustment
- No new user-facing capability and no schema change
- Estimated effort is small (roughly < 1 day)
- Doesn't require new success metrics — it serves metrics that already exist

If a "small fix" starts growing scope mid-flight (new dependency, new user flow, schema touch), **reclassify to Track A immediately** and backfill the required artifacts before continuing.

---

## 3. Track A — Required Artifacts (HARD GATE)

Stored at: `docs/pm/<project-slug>-prd.md`

All nine sections below must be present and free of `[TBD]` placeholders before this gate passes:

1. **Problem Statement & Opportunity** — what's broken or missing, for whom, and why now
2. **Goals & Success Metrics** — specific, measurable (e.g. "reduce checkout drop-off from 34% → 20%"), not vague ("improve UX")
3. **Scope** — explicit In-Scope and Out-of-Scope lists
4. **Requirements** — functional (user stories, "As a [user], I want X so that Y") and non-functional (performance, availability, compliance)
5. **Constraints & Assumptions** — tech stack limits, budget, timeline, dependencies on other work
6. **Risks** — what could derail this, with a mitigation or owner for each
7. **Prioritization** — MoSCoW (Must/Should/Could/Won't) or RICE score per requirement
8. **Acceptance Criteria** — testable, per requirement, phrased so Engineering and Security can verify pass/fail without asking you what you meant
9. **Definition of Ready checklist** — the explicit checklist in Section 5 below, checked off

## 4. Track B — Required Artifact (Lightweight Gate)

Stored at: `docs/pm/tickets/<ticket-id>.md`

- **Change** — one or two sentences, what's changing
- **Why** — the trigger (bug report, request, observed issue)
- **Acceptance Criteria** — at least one testable condition
- **Risk flag** — yes/no; if yes, explain in one line and consider reclassifying to Track A

---

## 5. GATE — Definition of Ready (must pass before handoff to UI/UX Designer)

This is a hard gate for Track A. Do not proceed to the Designer persona until every box is checked:

- [ ] Problem statement is specific and falsifiable (a reader could tell if it's wrong)
- [ ] At least one success metric is quantified with a baseline and target
- [ ] Scope has explicit Out-of-Scope items, not just In-Scope
- [ ] Every requirement has at least one acceptance criterion
- [ ] Requirements are prioritized (nothing is "everything is a Must")
- [ ] Risks section is non-empty, or explicitly states "no material risks identified" with reasoning
- [ ] No placeholder text (`[TBD]`, `TODO`, `???`) remains anywhere in the document
- [ ] File is committed at `docs/pm/<project-slug>-prd.md`

**For Track B:** the gate is just — mini-ticket exists, has at least one acceptance criterion, and risk flag is answered. If risk flag is "no" and there's no UI-facing change, **the Designer stage may be skipped** and work can go straight to the Software Engineer persona. Document the skip in the ticket (`design_stage: skipped — no UI impact`).

If a gate item cannot be satisfied honestly (e.g., you genuinely can't quantify a success metric yet), do not fake it. Log a **Waiver** instead (Section 6) — do not silently pass the gate.

---

## 6. Escalation / Exception Process

A gate item that can't be met yet does not mean skip it silently. Instead:

```
### Waiver: <gate item>
Reason: <why this can't be satisfied right now>
Owner: <you, or who>
Revisit by: <date or milestone>
```

Add this block to the PRD or ticket. A waiver is a visible, timestamped admission — not a bypass. Revisit it at the stated checkpoint; don't let waivers accumulate silently across a project.

---

## 7. Anti-Patterns (Guidelines — not blocking, but watch for these)

- Starting design or code before scope is locked "just to get a feel for it" — this is how scope creep enters
- Success metrics that can't fail ("improve performance") — if you can't imagine a number that would mean failure, it's not a real metric
- Acceptance criteria that only you could verify ("looks good") — write them so Security or a future reviewer could check them cold
- Letting a Track B ticket quietly become Track A without reclassifying and backfilling artifacts
- Treating the PRD as a one-time document — if scope changes mid-build, the PRD must be updated, not left stale

---

## 8. Downstream Contract

By passing this gate, the PM persona guarantees the **UI/UX Designer** persona can assume, without re-verifying:
- Scope is locked (In/Out is explicit)
- Target user(s) and their goals are known
- Every screen/flow the Designer builds maps to a prioritized requirement with acceptance criteria
- Success metrics exist, so Design decisions can be evaluated against them later

If any of the above isn't actually true, the gate should not have passed — go back and fix the PRD rather than letting the next persona inherit a false assumption.

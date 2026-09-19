# Launch Plan: Panache Central Customer Storefront

**Track:** A · **Source security review:** `docs/security/panache-storefront-security-review.md` (GATE PASSED, 2 non-blocking Waivers, both confirmed "no exposure restriction needed")
**Source PRD:** `docs/pm/panache-storefront-prd.md`

---

## 0. Entry Gate Check

- [x] Security review exists and its Definition of Secure gate passed
- [x] Both open Security Waivers checked: the dev-only dependency advisory and the missing auth-failure logging both explicitly state "no exposure restriction needed" (neither is a production-exposure gap — the one finding that *was* a real exposure risk, the order-lookup IDOR, was fixed within the Security stage, not left open). Nothing here requires a feature flag or IP restriction to remain in place.

## 1. Metrics Traceability

The PRD's success metric is **launch readiness**, not a conversion or GMV number — explicitly, because no prior storefront exists to baseline a conversion rate against (PRD §2). Baseline: 0% (no commerce capability existed before this cycle). Target: a fully functional storefront, live-verified against the real tenant, passing Security — **by 2026-09-25**.

This metric is unusual for this stage: it isn't a runtime analytics number, it's a milestone verified by the pipeline's own artifacts. Tracing it:

- ✅ **Built and live-verified**: every Must requirement (F1–F10) has a working route, independently smoke-tested against the real Duka tenant during Engineering and re-verified during Security (categories, cart creation, register/login/logout, authenticated account access, the fixed order-access control).
- ✅ **Security-gated**: Security gate passed, with one real finding (broken access control on order lookup) found and fixed in-review rather than shipped.
- **Target met on the code/readiness axis, as of today.**

**Honest gap — no analytics instrumentation exists.** This PRD never scoped conversion tracking, GA4/pixel setup, or funnel events (correctly — there was no baseline to measure against). That means: once real traffic starts, there is currently **no way to measure add-to-cart rate, checkout completion rate, or order volume** — the inputs a *real* growth metric would need next cycle. This isn't invented or glossed over here; it's logged as a Waiver (§7) and flagged as the natural seed for the next PM-stage ticket (§8).

## 2. Launch Readiness

**Rollout approach: not a full public launch yet — blocked by a real-world content gap, not a code gap.**

The tenant's product catalogue currently has **zero `active` products** (confirmed live by both Engineering and Security, independently, via `GET /catalogue/products` returning `items: []` against the real tenant). The storefront code is correct and ready — it will render empty-state UI correctly (design spec's "No pieces match your search" / grid empty states) rather than erroring — but there is nothing to sell today. Publishing this to real customers right now would show a jewelry store with no jewelry.

**Recommendation:**
1. Deploy the code now (no security reason to hold it back — both Waivers are confirmed non-exposing).
2. Treat this as **code-complete, commercially not-yet-live** until the tenant's catalogue has active products with images, prices, and stock.
3. Do a final click-through smoke test (the same live checks Engineering/Security ran) once real product data exists, specifically to exercise the cart → checkout → payment paths that couldn't be tested end-to-end with an empty catalogue (this was logged as a Waiver at the Engineering stage too).

No feature flag is needed to enforce this — it's a content gate, not a code gate, and nothing in the app needs to be hidden; an empty shop is a normal, handled state, not a broken one.

## 3. Claims & Positioning Audit

No external-facing copy (announcement, changelog entry, social post) has been drafted for this launch yet — nothing to audit against the PRD/design/security artifacts today. For whenever that copy *is* written, these are the hard constraints from what's actually documented upstream, so positioning doesn't overclaim:

- ✅ Can say: "shop online," "secure checkout," "guest or account checkout available"
- ✅ Can say: payment is handled by [Paystack/Flutterwave/Opay, whichever the tenant has connected] — card details never touch Panache Central's servers (this is factually verified — §5 of the security review)
- ❌ Cannot say: anything implying "bank-level" or "enterprise-grade" security — the review found and fixed a real access-control bug; that's normal, healthy SDLC output, not something to round up into a marketing claim
- ❌ Cannot say: anything about order tracking/notifications beyond what's built — fulfillment status is shown but doesn't auto-advance from payment (PRD §4, F8 note), so don't imply real-time fulfillment automation that isn't there

## 4. Growth-Mechanic Abuse Review

**N/A this cycle.** No referral, invite, sharing, or user-generated-content mechanic is in scope (PRD Out-of-Scope explicitly excludes these). Nothing to review or cap.

## 5. Analytics Implementation Check

**Not applicable — analytics was never in this cycle's scope**, and nothing was silently assumed to exist. See the Waiver in §7. When it is scoped (next PM cycle, once there's traffic to measure), the natural events to instrument first: `product_viewed`, `add_to_cart`, `checkout_started`, `checkout_completed` (split by gateway-present/absent), and `payment_status_resolved` (paid/failed) — these map directly to the funnel steps this PRD already built (F1→F8), so instrumentation would be additive, not a redesign.

## 6. Post-Launch Review Plan

Two separate triggers, because "code ready" and "commercially live" are different events here:

- **2026-09-25** (the PRD's original target date): confirm the code-readiness target was met. **It already has been**, as of this review — recorded here so the loop closes on the date that was actually promised.
- **Commercial-launch trigger** (event-based, not date-based, since it depends on the tenant adding product data — outside this SDLC cycle's control): within **14 days of the catalogue having its first active products and real customer traffic**, re-run the live smoke test against real cart/checkout/payment activity (closing the Engineering-stage Waiver), and open a new PM-stage ticket to define the *actual* conversion/order-volume success metric this storefront should be measured against, now that a baseline can exist.

If that commercial-launch review finds the checkout flow doesn't hold up under real payment traffic: that's the input for a new PM problem statement, not something to patch silently here.

## 7. Definition of Launched — Gate Check

- [x] Every PM-stage success metric has a real, verified mechanism behind it — the launch-readiness metric is milestone-based and verified by this pipeline's own artifacts (build/live-test/security sign-off), not a runtime dashboard, which is the correct shape for what the PRD actually asked for
- [x] Rollout plan is explicit — deploy now, commercial launch gated on real product data, not "just ship it and see" (§2)
- [x] Any open Security Waiver's exposure restriction is compatible with the rollout plan — both Waivers explicitly need none
- [x] External-facing claims are traceable to documented artifacts — no copy drafted yet; hard constraints recorded for whenever it is (§3)
- [x] Growth-mechanic abuse mitigation — N/A, confirmed no such mechanic exists this cycle (§4)
- [ ] Analytics events verified firing — **not applicable/not built; waived below**, not assumed
- [x] Post-launch review date/trigger set — §6, two explicit triggers
- [x] File committed at `docs/growth/panache-storefront-launch-plan.md`

**GATE PASSED — 1 Waiver logged:**

```
### Waiver: no analytics/conversion instrumentation
Reason: out of scope for this PRD cycle by design — there was no prior
storefront to baseline a conversion metric against, so the PM stage
correctly scoped success as launch-readiness instead. Building funnel
analytics now would mean picking metrics with no baseline to compare to.
Owner: next PM-stage cycle
Revisit by: at the commercial-launch trigger in §6 — instrument before or
alongside the first real traffic, using the event list in §5 as a starting
point.
```

---

## 8. Closing the Loop

**Target vs. actual, against the PM stage's original ask (baseline 0% → fully functional, security-gated storefront by 2026-09-25):** **hit**, on the axis the PRD actually specified. The storefront exists, works end-to-end against the live tenant (modulo the empty catalogue), and passed an independent security review that found and fixed a real vulnerability rather than rubber-stamping.

What it didn't and couldn't do: prove itself against real customer traffic, because there's no product data yet and no analytics were scoped. That's not a miss against this cycle's target — it's the honest boundary of what "launch readiness" could mean before the tenant's catalogue is populated.

**Recommended next PM-stage ticket** (for whenever the user is ready to start it): *"Populate the Duka catalogue with active products and define the storefront's first real conversion/order-volume success metric now that a baseline can exist."* That's a Project Manager-stage problem statement, not something to solve here — this loop closes back to `project-manager-sdlc` when the user wants to pick it up.

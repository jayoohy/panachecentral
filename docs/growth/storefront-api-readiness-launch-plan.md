# Launch Plan: Storefront API Readiness

**Track:** A · **Security review:** `docs/security/storefront-api-readiness-security-review.md` (gate passed, no open Waivers) · **Date:** 2026-09-24

## 1. Metrics Traceability
| PRD metric | Baseline → target | Tracking mechanism | Status |
|---|---|---|---|
| M1: storefront orders carrying `fulfilmentMethod` | 0% → 100% | Duka admin order list / `list_orders` (orders expose `fulfilmentMethod`) | Real, no instrumentation needed |
| M2: checkouts rejected with "Choose delivery or pickup." | 100% (live API already requires it) → 0 | Manual checkout on the live tenant; the new client can't send a request without the field (unit-tested allowlist + disabled submit) | Verifiable |
| M3: rail click-through | Not measurable | None: PRD Waiver (no analytics) | Carries over |

## 2. Launch Readiness
**Full rollout, deploy ASAP.** The live API already rejects the old checkout, so the current production storefront cannot take orders. There's no reason to phase this. No security Waivers restrict exposure.

Pre-deploy: place one real delivery order end to end, then cancel it in the admin (closes the Engineering Waiver).

## 3. Claims & Positioning Audit
No external announcement planned. On-site copy makes no new claims: delivery copy repeats the merchant's own note ("Delivery fee will be confirmed after you place your order."), and the rails say "New Arrivals" / "Best Sellers".
**Claim risk:** until the store records sales, "Best Sellers" shows the newest pieces (the API's documented fallback, §5.2), and on the live tenant today it lists exactly the same products as New Arrivals. That's a mild accuracy problem in the label. Recommendation: hide the Best Sellers rail until real sales exist (one-line change in `app/page.tsx`). Owner's call.

## 4. Growth-Mechanic Abuse Review
No referral, sharing, invite or UGC mechanic. Nothing to rate-limit beyond Duka's per-tenant limit.

## 5. Analytics Implementation Check
No analytics exists (existing Waiver in `panache-storefront-launch-plan.md` §7). M1/M2 don't need client events. When analytics is scoped, add `rail_product_clicked { rail }` and `checkout_fulfilment_selected { method }`.

## 6. Post-Launch Review
**2026-10-08 (14 days after deploy):**
- M1: every storefront order since deploy has `fulfilmentMethod`. If any don't, investigate immediately.
- M2: no "Choose delivery or pickup." reports.
- Decide whether to show Best Sellers yet, and whether featured products are set (the Featured rail stays hidden until they are).
- A miss on M1 or M2 → treat as a bug, not a new PM cycle.

## 7. Definition of Launched
- [x] Every PM metric has a real tracking mechanism (M1, M2); M3 waived at PM stage
- [x] Rollout plan explicit (full, ASAP)
- [x] No security Waiver restrictions to honour
- [x] No external claims; on-site label risk flagged (§3)
- [x] No growth mechanic
- [ ] Analytics events verified firing: N/A (no analytics; carries existing Waiver)
- [x] Post-launch review date set (2026-10-08)
- [ ] Committed: pending the owner's commit

---
id: GAP-scr-034
spec-item: SPEC-scr-037
domain: ui-screens
status: closed
discovered: "2026-05-27T00:00:00Z"
audit-spec-version: "45163ec1"
closed-by: WI-scr-034
deferred-reason: null
---

# Gap: Dashboard.tsx accesses ws.counts fields without optional chaining

**Locations:**
- `hub/client/src/screens/Dashboard.tsx:17`
- `hub/client/src/screens/Dashboard.tsx:92`

**Reasoning:** `computeTotals` and `WorkspaceTile` both dereference `w.counts.targetsAwaitingUser`, `w.counts.openGaps`, and related fields directly with no `?.` guard, risking a runtime TypeError when `counts` is absent.

---
id: GAP-scr-006
spec-item: SPEC-scr-015
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: fac28ba6
closed-by: WI-scr-006
deferred-reason: null
---

# Targets archived divider: not collapsible, wrong label styling, count not in mono span

**Location:** `hub/client/src/screens/Targets.tsx:321`

**Reasoning:** The archived divider is a static `<div>` with no click handler or toggle state — clicking it does not collapse/expand archived rows; there is no `▾`/`▸` caret prefix; `.targets-archived-divider__label` uses `letter-spacing: 0.08em` (not `0.18em`) and no `font-weight: 500`; the archived count `{archivedTargets.length}` is inline in the label string, not a separate `<span>` with `font-family: var(--mono)` and `letter-spacing: 0`.

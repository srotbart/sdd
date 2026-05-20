---
id: GAP-scr-005
spec-item: SPEC-scr-014
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: fac28ba6
closed-by: WI-scr-005
deferred-reason: null
---

# Targets list: wrong background variable and no archived row opacity

**Locations:**
- `hub/client/src/screens/Targets.css:67`
- `hub/client/src/screens/Targets.css:116`

**Reasoning:** `.targets-list` uses `background: var(--paper-2)` instead of required `var(--paper)`; archived `TargetListRow` items have no `opacity: 0.55` style (no CSS class or inline style distinguishes them from active rows), and no hover opacity `0.85` or selected opacity `1` with `var(--paper-2)` background.

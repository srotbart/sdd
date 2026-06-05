---
id: GAP-scr-046
spec-item: SPEC-scr-048
domain: ui-screens
status: closed
discovered: "2026-06-05T01:30:00Z"
audit-spec-version: "dccf375f"
closed-by: WI-scr-048
deferred-reason: null
---

# Gap: Session screen navigates to Targets instead of opening a detail panel

**Locations:**
- `hub/client/src/screens/Session.tsx:221`
- `hub/client/src/screens/Session.tsx:235`
- `hub/client/src/screens/Session.tsx:253`
- `hub/client/src/screens/Session.tsx:268`
- `hub/client/src/screens/Targets.tsx:59`

**Reasoning:** All four target-row click handlers in Session.tsx call `onNav('targets', t.id)` (navigating away), and `TargetDetail` in Targets.tsx is not exported, so the Session screen cannot render the panel inline.

---
id: GAP-scr-003
spec-item: SPEC-scr-011
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: fac28ba6
closed-by: WI-scr-003
deferred-reason: null
---

# Targets composer: "mark ready" button only shown for awaiting-user status

**Location:** `hub/client/src/screens/Targets.tsx:219`

**Reasoning:** The "mark ready" ghost button renders only inside `{target.status === 'awaiting-user' && ...}`, but spec requires it to always be present in the toolbar row; the muted one-line hint "sets status → awaiting-agent" is rendered as `action.hint` only when truthy, and `awaiting-agent` has hint `'agent will respond next session'` not the required `"sets status → awaiting-agent"`.

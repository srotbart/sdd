---
id: GAP-ui-018
spec-item: SPEC-ui-010
domain: ui-layout
status: closed
discovered: "2026-05-27T00:00:00Z"
audit-spec-version: "dadde7e1"
closed-by: WI-ui-018
deferred-reason: null
---

# Gap: alertCount reads server-computed value instead of being derived from liveTargets

**Location:** `hub/client/src/App.tsx:408`

**Reasoning:** `alertCount: ws.counts?.targetsAwaitingUser ?? 0` delegates to a server-pre-computed field; spec requires client-side derivation from `liveTargets` filtered to `status === 'awaiting-user'` per workspace.

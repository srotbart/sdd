---
id: GAP-ui-011
spec-item: SPEC-ui-010
domain: ui-layout
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "78abf73e"
closed-by: WI-ui-011
deferred-reason: null
---

# Gap: Sidenav receives workspaces without alertCount — awaiting-user target count not computed

**Location:** `hub/client/src/App.tsx:462-466`

**Reasoning:** The `workspaces.map` passed to `<Sidenav>` only projects `{ id, name, path }` and never computes `alertCount` from `liveTargets.filter(t => t.status === 'awaiting-user' && t.workspaceId === ws.id)`, so the alert badge is always absent.

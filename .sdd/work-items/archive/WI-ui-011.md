---
id: WI-ui-011
gap-id: GAP-ui-011
domain: ui-layout
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Compute and pass alertCount per workspace to Sidenav

**Scope:** `hub/client/src/App.tsx:462-466` — in the `workspaces.map` passed to `<Sidenav>`, add `alertCount: liveTargets.filter(t => t.status === 'awaiting-user' && t.workspaceId === ws.id).length` for each workspace

**Acceptance criteria:**
- Each workspace entry passed to Sidenav includes `alertCount` equal to the number of awaiting-user targets for that workspace
- Sidenav badge appears when `alertCount > 0` and is absent when `alertCount === 0`
- Count updates reactively when `liveTargets` changes
- Unit test: workspace with one awaiting-user target shows alertCount of 1; workspace with no awaiting-user targets shows alertCount of 0

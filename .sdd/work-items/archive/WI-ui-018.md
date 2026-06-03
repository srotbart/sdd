---
id: WI-ui-018
gap-id: GAP-ui-018
domain: ui-layout
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Derive sidenav alertCount from liveTargets instead of server-computed counts

**Scope:** `hub/client/src/App.tsx:404` — replace `alertCount: ws.counts?.targetsAwaitingUser ?? 0` with a client-side derivation: filter `liveTargets` to `status === 'awaiting-user'` and count those belonging to `ws.id`.

**Acceptance criteria:**
- `alertCount` is computed from `liveTargets.filter(t => t.status === 'awaiting-user' && /* belongs to ws */).length`
- The sidenav badge updates immediately when `liveTargets` changes without a page reload
- Unit test: when `liveTargets` contains 2 awaiting-user targets, the sidenav badge count reflects 2
- Unit test: when no targets are awaiting-user, the badge is absent

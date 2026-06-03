---
id: WI-scr-034
gap-id: GAP-scr-034
domain: ui-screens
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add optional chaining to all ws.counts accesses in Dashboard.tsx

**Scope:** `hub/client/src/screens/Dashboard.tsx:17` and `:92` — replace every direct `w.counts.field` and `ws.counts.field` dereference in `computeTotals`, `WorkspaceTile`, and JSX with `w.counts?.field ?? 0` / `ws.counts?.field ?? 0` so a workspace without counts does not throw a TypeError.

**Acceptance criteria:**
- Every `w.counts.` and `ws.counts.` access in `Dashboard.tsx` uses optional chaining (`?.`) with a numeric fallback (`?? 0`)
- No direct `w.counts.field` or `ws.counts.field` dereference remains in the file
- `App.test.tsx` snapshot test fixture (`snapshotWs`) includes a complete `counts: WorkspaceCounts` object so the snapshot test produces no unhandled error
- Unit test: Dashboard renders without throwing when a workspace in the array has `counts: undefined`
- Unit test: Dashboard renders without throwing when workspaces array is empty

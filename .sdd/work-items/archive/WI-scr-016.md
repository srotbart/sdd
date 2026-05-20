---
id: WI-scr-016
gap-id: [GAP-scr-016, GAP-scr-017]
domain: ui-screens
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Wire Gaps and WorkItems screens to live API data in App.tsx

**Scope:** `hub/client/src/App.tsx` — add `liveGaps` and `liveWorkItems` state, fetch `/workspaces/:id/gaps` and `/workspaces/:id/work-items` on `activeWorkspaceId` change, pass live data to `<Gaps>` and `<WorkItems>` replacing `MOCK_GAPS` and `MOCK_WORK_ITEMS`

**Acceptance criteria:**
- `App.tsx` has a `liveGaps` state initialised to `[]` and fetched from `GET /workspaces/:id/gaps` whenever `activeWorkspaceId` changes
- `App.tsx` has a `liveWorkItems` state initialised to `[]` and fetched from `GET /workspaces/:id/work-items` whenever `activeWorkspaceId` changes
- `<Gaps>` receives `liveGaps` instead of `MOCK_GAPS`
- `<WorkItems>` receives `liveWorkItems` instead of `MOCK_WORK_ITEMS`
- Sidenav `tabCounts` for `gaps` and `work items` use live data with the same non-archived filter logic
- Test: fetching `/workspaces/:id/gaps` returns the gaps array from the server (integration or unit test using the existing test pattern)
- Test: fetching `/workspaces/:id/work-items` returns the work-items array from the server

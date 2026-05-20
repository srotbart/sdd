---
id: GAP-scr-017
spec-item: SPEC-scr-021
domain: ui-screens
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: "379b301b"
closed-by: WI-scr-016
deferred-reason: null
---

# Gap: WorkItems screen uses mock data instead of fetching live data

**Location:** hub/client/src/App.tsx:245

**Reasoning:** The `work items` case passes `MOCK_WORK_ITEMS` to `<WorkItems>` with no `fetch('/workspaces/:id/work-items')` call triggered by `activeWorkspaceId` changes, so the screen never shows real work-item data.

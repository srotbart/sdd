---
id: GAP-ui-014
spec-item: SPEC-ui-016
domain: ui-layout
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "78abf73e"
closed-by: WI-ui-014
deferred-reason: null
---

# Gap: AttachWorkspaceDialog uses hardcoded RECENT_FOLDERS constant instead of fetching GET /recent-workspaces

**Location:** `hub/client/src/components/AttachWorkspaceDialog.tsx:12-17`

**Reasoning:** The `RECENT_FOLDERS` array is a static module-level constant; there is no `useEffect` or fetch call to `GET /recent-workspaces` on dialog open, violating SPEC-ui-016's requirement that recent folders come from a live API call.

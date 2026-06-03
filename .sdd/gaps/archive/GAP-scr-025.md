---
id: GAP-scr-025
spec-item: SPEC-scr-028
domain: ui-screens
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "b97bcf38"
closed-by: WI-scr-025
deferred-reason: null
---

# Gap: Dashboard receives MOCK_WORKSPACES instead of live WorkspaceData from GET /workspaces

**Location:** `hub/client/src/App.tsx:457`

**Reasoning:** `<Dashboard>` is passed the static `MOCK_WORKSPACES` constant; SPEC-scr-028 requires passing the live `WorkspaceData[]` fetched from `GET /workspaces` so the summary strip and tiles reflect real counts and agent IDs.

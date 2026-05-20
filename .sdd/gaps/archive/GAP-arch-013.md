---
id: GAP-arch-013
spec-item: SPEC-arch-010
domain: architecture
status: closed
discovered: "2026-05-15T00:00:00Z"
audit-spec-version: "85924307"
closed-by: WI-arch-010
deferred-reason: null
---

# Gap: Workspace list is hardcoded mock data, not fetched from GET /workspaces

**Location:** client/src/App.tsx — MOCK_WORKSPACES is a static array; GET /workspaces is never called by the UI

**Reasoning:** The endpoint exists and returns live data from SQLite, but the client ignores it and renders hardcoded mock workspaces instead.

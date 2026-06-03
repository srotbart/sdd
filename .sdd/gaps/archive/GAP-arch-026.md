---
id: GAP-arch-026
spec-item: SPEC-arch-030
domain: architecture
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "6165d585"
closed-by: WI-arch-024
deferred-reason: null
---

# Gap: GET /workspaces returns bare DbWorkspace[], not enriched WorkspaceData with counts/agents/lastActivity

**Location:** `hub/server/index.ts:166-169`

**Reasoning:** The handler calls `getAllWorkspaces()` directly returning `DbWorkspace[]` without augmenting with `counts`, `agents`, or `lastActivity` fields required by SPEC-arch-030.

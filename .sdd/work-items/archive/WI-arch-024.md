---
id: WI-arch-024
gap-id: GAP-arch-026
domain: architecture
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Enrich GET /workspaces response with counts, agent IDs, and lastActivity

**Scope:** `hub/server/index.ts` and `hub/server/db/index.ts` — (1) add a `getWorkspacesEnriched()` function that reads `.sdd/` file counts and connected agent IDs per workspace; (2) replace `getAllWorkspaces()` in the `GET /workspaces` handler with `getWorkspacesEnriched()`; return `WorkspaceData[]` with `counts`, `agents`, and `lastActivity` fields

**Acceptance criteria:**
- `GET /workspaces` response includes `counts.targetsAwaitingUser`, `openGaps`, `workInProgress`, `workBlocked` per workspace
- `GET /workspaces` response includes `agents` array of connected agent IDs per workspace
- `GET /workspaces` response includes `lastActivity` ISO timestamp (most recent `.sdd/` file mtime, or `created_at` if none)
- Response `Content-Type` remains `application/json`
- Unit test: workspace with known `.sdd/` structure returns correct counts
- Unit test: workspace with no `.sdd/` files returns zero counts and `lastActivity === created_at`

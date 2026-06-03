---
id: SPEC-arch-030
domain: architecture
abbrev: arch
status: active
aliases: []
version: "ca02689b"
---

# SPEC-arch-030 — GET /workspaces returns enriched WorkspaceData including live counts and agent IDs

`GET /workspaces` is extended to return `WorkspaceData[]` instead of bare `DbWorkspace[]`. Each entry augments the base workspace fields with: `counts` (object with `targetsAwaitingUser`, `openGaps`, `workInProgress`, `workBlocked` — each a live count computed from the workspace's `.sdd/` files); `agents` (array of agent IDs currently connected to this workspace); `lastActivity` (ISO timestamp of the most recent `.sdd/` file change, or `created_at` if none). This replaces `MOCK_WORKSPACES` as the Dashboard's data source.

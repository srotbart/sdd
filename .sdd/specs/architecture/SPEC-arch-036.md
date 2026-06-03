---
id: SPEC-arch-036
domain: architecture
abbrev: arch
status: active
aliases: []
version: "c27dc3ad"
---

# SPEC-arch-036 — WebSocket snapshot and update messages deliver enriched WorkspaceData

`buildSnapshot()` and `broadcastUpdate()` in `ws-ui.ts` must call `getWorkspacesEnriched()` rather than `getAllWorkspaces()`. WebSocket `snapshot` and `update` messages must carry the full `WorkspaceData[]` shape including `counts`, `agents`, and `lastActivity` — the same shape returned by `GET /workspaces`. Clients that process these messages must receive correctly enriched data so that live WebSocket updates do not overwrite REST-fetched enriched data with bare workspace rows.

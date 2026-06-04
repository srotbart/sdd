---
id: SPEC-arch-036
domain: architecture
abbrev: arch
status: active
aliases: []
version: "75a5ca58"
---

# SPEC-arch-036 — WebSocket snapshot and update messages deliver enriched WorkspaceData

`buildSnapshot()` and `broadcastUpdate()` in `ws-ui.ts` must call `getWorkspacesEnriched()` rather than `getAllWorkspaces()`. WebSocket `snapshot` and `update` messages must carry the full `WorkspaceData[]` shape including `counts`, `agents`, and `lastActivity` — the same shape returned by `GET /workspaces`. Clients that process these messages must receive correctly enriched data so that live WebSocket updates do not overwrite REST-fetched enriched data with bare workspace rows.

**Tests:**
hub/server/spec-arch-ws.test.ts > SPEC-arch-005/036: UI WebSocket endpoint sends enriched snapshot on connect > SPEC-arch-036: snapshot carries enriched WorkspaceData (counts, agents, lastActivity) — "the WebSocket snapshot delivers enriched WorkspaceData"
hub/server/spec-arch-ws.test.ts > SPEC-arch-005/036: UI WebSocket endpoint sends enriched snapshot on connect > SPEC-arch-036: update message also carries enriched WorkspaceData — "the WebSocket update message delivers enriched WorkspaceData"

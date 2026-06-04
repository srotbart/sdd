---
id: SPEC-arch-025
domain: architecture
abbrev: arch
status: active
aliases: []
version: "250c173c"
---

# SPEC-arch-025 — All server→client WebSocket message types have formal schemas

Five typed messages are sent from server to UI clients over WebSocket. Their canonical shapes: `snapshot` — `{ type: "snapshot", workspaces: DbWorkspace[], agents: Agent[] }` sent once on connection; `update` — `{ type: "update", changedPath: string, workspaces: DbWorkspace[], agents: Agent[] }` sent on any workspace or agent state change; `sdd-changed` — defined in SPEC-arch-018; `agent-registered` — `{ type: "agent-registered", agentId: string, workspaceId: string }` sent when an agent connects; `activity` — `{ type: "activity", agentId: string, workspaceId: string, kind: "in" | "note" | "err", msg: string, t: string }` sent when an agent emits an activity event.

**Tests:**
hub/server/spec-arch-ws.test.ts > SPEC-arch-018/025/038: typed server→client messages > SPEC-arch-025/038: agent-registered message has {type, agentId, workspaceId} — "the agent-registered message has its canonical schema shape"
hub/server/spec-arch-ws.test.ts > SPEC-arch-018/025/038: typed server→client messages > SPEC-arch-025/038: activity message has {type, agentId, workspaceId, kind, msg, t} — "the activity message has its canonical schema shape"

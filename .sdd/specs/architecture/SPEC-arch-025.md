---
id: SPEC-arch-025
domain: architecture
abbrev: arch
status: active
aliases: []
version: "33deed66"
---

# SPEC-arch-025 — All server→client WebSocket message types have formal schemas

Five typed messages are sent from server to UI clients over WebSocket. Their canonical shapes: `snapshot` — `{ type: "snapshot", workspaces: DbWorkspace[], agents: Agent[] }` sent once on connection; `update` — `{ type: "update", changedPath: string, workspaces: DbWorkspace[], agents: Agent[] }` sent on any workspace or agent state change; `sdd-changed` — defined in SPEC-arch-018; `agent-registered` — `{ type: "agent-registered", agentId: string, workspaceId: string }` sent when an agent connects; `activity` — `{ type: "activity", agentId: string, workspaceId: string, kind: "in" | "note" | "err", msg: string, t: string }` sent when an agent emits an activity event.

---
id: SPEC-arch-038
domain: architecture
abbrev: arch
status: active
aliases: []
version: "f591a876"
---

# SPEC-arch-038 — UiMessage union includes AgentRegisteredMessage and ActivityMessage types

The `UiMessage` union type in `ws-ui.ts` is extended to include all 5 server→client message types defined in SPEC-arch-025: `AgentRegisteredMessage { type: "agent-registered"; agentId: string; workspaceId: string }` and `ActivityMessage { type: "activity"; agentId: string; workspaceId: string; kind: "in" | "note" | "err"; msg: string; t: string }`. Both types are exported and replace the untyped `broadcastRaw()` calls that currently emit them.

**Tests:**
hub/server/spec-arch-ws.test.ts > SPEC-arch-018/025/038: typed server→client messages > SPEC-arch-025/038: agent-registered message has {type, agentId, workspaceId} — "the agent-registered union member is emitted with its typed shape"
hub/server/spec-arch-ws.test.ts > SPEC-arch-018/025/038: typed server→client messages > SPEC-arch-025/038: activity message has {type, agentId, workspaceId, kind, msg, t} — "the activity union member is emitted with its typed shape"

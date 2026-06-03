---
id: SPEC-arch-038
domain: architecture
abbrev: arch
status: active
aliases: []
version: "00f9e7a6"
---

# SPEC-arch-038 — UiMessage union includes AgentRegisteredMessage and ActivityMessage types

The `UiMessage` union type in `ws-ui.ts` is extended to include all 5 server→client message types defined in SPEC-arch-025: `AgentRegisteredMessage { type: "agent-registered"; agentId: string; workspaceId: string }` and `ActivityMessage { type: "activity"; agentId: string; workspaceId: string; kind: "in" | "note" | "err"; msg: string; t: string }`. Both types are exported and replace the untyped `broadcastRaw()` calls that currently emit them.

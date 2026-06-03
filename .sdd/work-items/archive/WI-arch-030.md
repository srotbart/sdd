---
id: WI-arch-030
gap-id: GAP-arch-033
domain: architecture
status: done
created: 2026-05-20T00:00:00Z
abandoned-reason: null
---

# Work Item: Add AgentRegisteredMessage and ActivityMessage to UiMessage union; replace broadcastRaw with typed broadcasts

**Scope:** `hub/server/ws-ui.ts` and `hub/server/ws-agent.ts` — define `AgentRegisteredMessage` and `ActivityMessage` interfaces, add them to the `UiMessage` union, export typed broadcast functions, and replace the two `broadcastRaw()` call sites in `ws-agent.ts` with the new typed functions.

**Acceptance criteria:**
- `AgentRegisteredMessage { type: "agent-registered"; agentId: string; workspaceId: string }` is defined and exported from `ws-ui.ts`
- `ActivityMessage { type: "activity"; agentId: string; workspaceId: string; kind: "in" | "note" | "err"; msg: string; t: string }` is defined and exported from `ws-ui.ts`
- `UiMessage` union includes all 5 types: `StateSnapshot | UpdateMessage | SddChangedMessage | AgentRegisteredMessage | ActivityMessage`
- `broadcastRaw()` is replaced by typed `broadcastAgentRegistered()` and `broadcastActivity()` functions (or equivalent)
- `ws-agent.ts` uses the typed broadcast functions instead of `broadcastRaw()`
- Server tests: emitting agent-registered produces a message parseable as `AgentRegisteredMessage`
- Server tests: emitting activity produces a message parseable as `ActivityMessage`

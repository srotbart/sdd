---
id: GAP-arch-033
spec-item: SPEC-arch-038
domain: architecture
status: closed
discovered: 2026-05-20T00:00:00Z
audit-spec-version: "50f69669"
closed-by: WI-arch-030
deferred-reason: null
---

# Gap: UiMessage union type missing AgentRegisteredMessage and ActivityMessage types

**Location:** `hub/server/ws-ui.ts:26`

**Reasoning:** `UiMessage` is declared as `StateSnapshot | UpdateMessage | SddChangedMessage` only; `AgentRegisteredMessage` and `ActivityMessage` are not included in the union, and `broadcastRaw()` is used instead of typed broadcast functions for these two message types.

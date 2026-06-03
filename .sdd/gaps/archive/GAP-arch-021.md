---
id: GAP-arch-021
spec-item: SPEC-arch-025
domain: architecture
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "6165d585"
closed-by: WI-arch-021
deferred-reason: null
---

# Gap: Activity message broadcast uses event/detail shape, not kind/msg/t

**Location:** `hub/server/ws-agent.ts:92-97`

**Reasoning:** The broadcast shape uses `{ type: "activity", agentId, event, detail }` but SPEC-arch-025 requires `{ type: "activity", agentId, workspaceId, kind: "in" | "note" | "err", msg, t }`.

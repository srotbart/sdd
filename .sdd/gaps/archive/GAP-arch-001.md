---
id: GAP-arch-001
spec-item: SPEC-arch-006
domain: architecture
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "651d284b"
closed-by: WI-arch-019
deferred-reason: null
---

# Gap: Agent status never transitions to "busy"

**Location:** `hub/server/ws-agent.ts:72`

**Reasoning:** Agent is always registered with `status: "idle"` and `updateAgentStatus` is never called from ws-agent.ts, so agents cannot be tracked as "busy" as required by SPEC-arch-006.

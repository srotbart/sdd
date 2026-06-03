---
id: WI-arch-019
gap-id: GAP-arch-001
domain: architecture
status: done
created: "2026-05-18T00:00:00Z"
abandoned-reason: null
---

# Work Item: Implement agent status transitions (idle/busy) in ws-agent.ts

**Scope:** `hub/server/ws-agent.ts` — call `updateAgentStatus` to transition agents between "idle" and "busy" based on activity messages, so the server correctly tracks agent status as required by SPEC-arch-006.

**Acceptance criteria:**
- Agent status transitions to "busy" when an activity message with a work-start event is received and back to "idle" when work completes or agent disconnects
- `updateAgentStatus` from `db/index.ts` is called appropriately in `ws-agent.ts`
- Unit test: agent registered as "idle", transitions to "busy" on activity, returns to "idle" on close
- UI snapshot broadcast reflects updated agent status

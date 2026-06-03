---
id: GAP-uic-012
spec-item: SPEC-uic-004
domain: ui-components
status: closed
discovered: "2026-05-27T00:00:00Z"
audit-spec-version: "d5e3dee4"
closed-by: WI-uic-015
deferred-reason: null
---

# Gap: AgentChip circle color derived from agent.status, not agent.id

**Location:** `hub/client/src/components/AgentChip.tsx:16`

**Reasoning:** The avatar circle class is `agent-chip__av--${agent.status}` (busy/idle), so color varies with live status rather than being deterministically derived from `agent.id` for consistency; two agents with the same status always get the same color regardless of identity.

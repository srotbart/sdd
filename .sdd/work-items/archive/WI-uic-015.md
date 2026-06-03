---
id: WI-uic-015
gap-id: GAP-uic-012
domain: ui-components
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Derive AgentChip avatar circle color from agent.id instead of agent.status

**Scope:** `hub/client/src/components/AgentChip.tsx:16` — replace `agent-chip__av--${agent.status}` with a deterministic color derived from `agent.id` (e.g. pick one of N palette classes by hashing the ID string), and update `AgentChip.css` to define those palette classes instead of busy/idle status classes.

**Acceptance criteria:**
- Avatar circle class is derived from `agent.id`, not `agent.status`
- Two agents with the same status but different IDs get different circle colors
- The same agent always gets the same color regardless of status changes
- `AgentChip.css` defines the palette color classes used for ID-based derivation
- Unit test: two agents with same status but different IDs render different avatar classes
- Unit test: the same agent ID always produces the same avatar class

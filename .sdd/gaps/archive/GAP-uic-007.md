---
id: GAP-uic-007
spec-item: SPEC-uic-007
domain: ui-components
status: closed
discovered: 2026-05-20T00:00:00Z
audit-spec-version: "e48bbe04"
closed-by: WI-uic-010
deferred-reason: null
---

# Gap: AgentChip does not destructure or apply the size prop; CSS lacks --sm, --md, and --unassigned rules

**Locations:**
- `hub/client/src/components/AgentChip.tsx:9` — `size` prop is declared in the interface but not destructured in the function signature or applied to any className
- `hub/client/src/components/AgentChip.css:1` — no `.agent-chip--sm`, `.agent-chip--md`, or `.agent-chip--unassigned` CSS rules exist

**Reasoning:** The spec requires `size` to apply `.agent-chip--sm` or leave the default, and `.agent-chip--unassigned` to have an explicit self-sufficient muted style; neither is implemented.

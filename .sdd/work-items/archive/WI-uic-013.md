---
id: WI-uic-013
gap-id: GAP-uic-010
domain: ui-components
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Replace bare unassigned span with AgentChip in ArchiveFooter

**Scope:** `hub/client/src/components/ArchiveFooter.tsx:184` — replace `<span className="arch-card__unassigned">unassigned</span>` in the agent-null branch with `<AgentChip agent={null} />` so the unassigned state uses the shared component style.

**Acceptance criteria:**
- The `agent === null` branch in `arch-card__foot` renders `<AgentChip agent={null} />` not a bare span
- The `.arch-card__unassigned` span is removed from ArchiveFooter
- Unit test: an archived work item with no agent renders the AgentChip unassigned pill (not a bare span)
- Unit test: an archived work item with an agent renders AgentChip with agent data

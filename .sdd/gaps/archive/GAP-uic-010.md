---
id: GAP-uic-010
spec-item: SPEC-uic-002
domain: ui-components
status: closed
discovered: "2026-05-27T00:00:00Z"
audit-spec-version: "d5e3dee4"
closed-by: WI-uic-013
deferred-reason: null
---

# Gap: ArchiveFooter renders bare unassigned span instead of AgentChip

**Location:** `hub/client/src/components/ArchiveFooter.tsx:184`

**Reasoning:** When `agent` is null the card renders `<span className="arch-card__unassigned">unassigned</span>` instead of `<AgentChip agent={null} />`, bypassing the shared AgentChip unassigned style defined in SPEC-uic-004 and SPEC-uic-007.

---
id: GAP-uic-004
spec-item: SPEC-uic-004
domain: ui-components
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "0226ee52"
closed-by: WI-uic-007
deferred-reason: null
---

# Gap: AgentChip does not accept null/undefined agent and has no 'unassigned' fallback

**Locations:**
- `hub/client/src/components/AgentChip.tsx:4-7`
- `hub/client/src/components/AgentChip.tsx:8`

**Reasoning:** `AgentChipProps` declares `agent: Agent` (not `Agent | null | undefined`) and the component renders `agent.initials`/`agent.name` unconditionally; SPEC-uic-004 requires the component to accept null/undefined and render a muted "unassigned" fallback pill. Also missing: `size?: 'sm' | 'md'` prop.

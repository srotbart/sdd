---
id: WI-uic-007
gap-id: GAP-uic-004
domain: ui-components
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Add null/undefined agent support and size prop to AgentChip

**Scope:** `hub/client/src/components/AgentChip.tsx` — (1) change `AgentChipProps` so `agent` is typed `Agent | null | undefined`; (2) add `size?: 'sm' | 'md'` prop; (3) when `agent` is null or undefined, render a muted "unassigned" fallback pill (`<span class="agent-chip agent-chip--unassigned">unassigned</span>`) instead of accessing `agent.initials`/`agent.name`

**Acceptance criteria:**
- `AgentChipProps.agent` is typed `Agent | null | undefined`
- `AgentChipProps.size` is typed `'sm' | 'md'` (optional)
- Passing `null` or `undefined` renders an "unassigned" fallback pill, not an error
- Passing a valid `Agent` renders initials and name as before
- Unit test: `<AgentChip agent={null} />` renders "unassigned" text
- Unit test: `<AgentChip agent={undefined} />` renders "unassigned" text
- Unit test: `<AgentChip agent={validAgent} />` renders agent initials and name

---
id: SPEC-uic-004
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "1b44cffc"
---

# SPEC-uic-004 — AgentChip is a shared component for agent identity pills

`hub/client/src/components/AgentChip.tsx` renders an agent identity pill used wherever an agent is associated with an artifact. Props: `agent: Agent | null | undefined`, `size?: 'sm' | 'md'`. When `agent` is null or undefined, renders an "unassigned" fallback pill in muted style. The pill displays the agent's `initials` in a colored circle (color derived from agent ID for consistency) and the agent's `name` as a label. Consumed in WorkItems, ArchiveFooter, Session, Activity, and Dashboard.
    

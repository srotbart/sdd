---
id: SPEC-uic-004
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "d9ce873f"
---

# SPEC-uic-004 — AgentChip is a shared component for agent identity pills

`hub/client/src/components/AgentChip.tsx` renders an agent identity pill used wherever an agent is associated with an artifact. Props: `agent: Agent | null | undefined`, `size?: 'sm' | 'md'`. When `agent` is null or undefined, renders an "unassigned" fallback pill in muted style. The pill displays the agent's `initials` in a colored circle (color derived from agent ID for consistency) and the agent's `name` as a label. Consumed in WorkItems, ArchiveFooter, Session, Activity, and Dashboard.

**Tests:**
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-004 AgentChip identity pill > SPEC-uic-004: renders the unassigned fallback pill when agent is null or undefined` — null/undefined agent renders the muted "unassigned" fallback pill.
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-004 AgentChip identity pill > SPEC-uic-004: renders the agent initials in a colored avatar and the agent name as a label` — a valid agent shows its initials avatar and name label.
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-004 AgentChip identity pill > SPEC-uic-004: avatar color is derived from the agent id (stable per id, differs across ids)` — avatar color class is a stable function of agent id, independent of status.
    

---
id: SPEC-uic-007
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "cc89d04c"
---

# SPEC-uic-007 — AgentChip size variants and unassigned state have explicit styles

`AgentChip.tsx` destructures and applies the `size` prop: `'sm'` applies `.agent-chip--sm` (reduced font-size and padding), `'md'` is the default size with no modifier class. `AgentChip.css` defines both size variant rules. The `.agent-chip--unassigned` class has an explicit CSS rule with a self-sufficient muted style (e.g. `color: var(--ink-4)`, `background: var(--paper-3)`, `border: 1px dashed var(--hair)`) so the unassigned pill renders correctly regardless of its container (SPEC-uic-006).

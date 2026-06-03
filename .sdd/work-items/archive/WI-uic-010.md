---
id: WI-uic-010
gap-id: GAP-uic-007
domain: ui-components
status: done
created: 2026-05-20T00:00:00Z
abandoned-reason: null
---

# Work Item: Apply size prop in AgentChip.tsx and add --sm, --md, --unassigned CSS rules

**Scope:** `hub/client/src/components/AgentChip.tsx` and `hub/client/src/components/AgentChip.css` — destructure `size` in the function signature and apply `.agent-chip--sm` modifier class when `size === 'sm'`; add explicit CSS rules for `.agent-chip--sm`, `.agent-chip--md`, and `.agent-chip--unassigned`.

**Acceptance criteria:**
- `AgentChip` function destructures `size` from props and applies `.agent-chip--sm` class when `size === 'sm'`
- `.agent-chip--sm` CSS rule exists with reduced font-size and padding
- `.agent-chip--md` CSS rule exists (may be a no-op comment or empty override making the default explicit)
- `.agent-chip--unassigned` CSS rule exists with explicit self-sufficient muted style (color, background, border — no inherited dependencies)
- TypeScript compiles without errors
- Client test: `AgentChip` with `size="sm"` renders the `.agent-chip--sm` class
- Client test: `AgentChip` with no agent renders the `.agent-chip--unassigned` class

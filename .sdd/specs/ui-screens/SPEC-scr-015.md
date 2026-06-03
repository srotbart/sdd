---
id: SPEC-scr-015
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "37b3bd3c"
---

# SPEC-scr-015 — Targets screen archived divider is collapsible with correct eyebrow styling

The archived section divider in the Targets list is interactive: clicking it toggles the archived rows open or closed. The label prepends `▾` (open) or `▸` (closed) as a caret. Label styling: `letter-spacing: 0.18em`, `font-weight: 500`, `text-transform: uppercase`, `font-size: 10px`, `color: var(--ink-3)`. The archived count renders in a separate `<span>` with `font-family: var(--mono)`, `letter-spacing: 0`, `color: var(--ink-4)`.

**Tests:**
- `hub/client/src/screens/Targets.test.tsx > Targets archived divider collapsible (WI-scr-006) > clicking divider hides archived rows` — "Clicking the archived divider collapses archived rows"
- `hub/client/src/screens/Targets.test.tsx > Targets archived divider collapsible (WI-scr-006) > divider label shows ▸ when archived section is collapsed` — "Collapsed divider shows ▸ caret"
- `hub/client/src/screens/Targets.test.tsx > Targets archived divider eyebrow styling (WI-scr-002) > .artifact-list-divider__label has letter-spacing: 0.18em` — "Divider label letter-spacing is 0.18em"

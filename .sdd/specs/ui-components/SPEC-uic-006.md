---
id: SPEC-uic-006
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "79fb674e"
---

# SPEC-uic-006 — Each UI component declares all its own visual styles; containers may override but not define

Every component in `hub/client/src/components/` and every row element in `hub/client/src/screens/` must declare all its own visual properties — background, foreground color, typography, border, spacing, and opacity — in its own CSS file. No component may rely on inherited or ambient CSS from a parent container to achieve its intended appearance. A component must render correctly regardless of where it is placed. When a specific placement requires a style deviation, the container overrides the component's class in a scoped selector; the component's own CSS always provides a complete, self-sufficient baseline. `ArtifactList` enforces this for rows by wrapping active rows in `.artifact-list-active-row { background: var(--paper) }` and archived rows in `.artifact-list-archived-row`.

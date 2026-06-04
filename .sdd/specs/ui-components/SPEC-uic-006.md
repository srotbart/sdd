---
id: SPEC-uic-006
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "b0b52b53"
---

# SPEC-uic-006 — Each UI component declares all its own visual styles; containers may override but not define

Every component in `hub/client/src/components/` and every row element in `hub/client/src/screens/` must declare all its own visual properties — background, foreground color, typography, border, spacing, and opacity — in its own CSS file. No component may rely on inherited or ambient CSS from a parent container to achieve its intended appearance. A component must render correctly regardless of where it is placed. When a specific placement requires a style deviation, the container overrides the component's class in a scoped selector; the component's own CSS always provides a complete, self-sufficient baseline. `ArtifactList` enforces this for rows by wrapping active rows in `.artifact-list-active-row { background: var(--paper) }` and archived rows in `.artifact-list-archived-row`.

**Tests:**
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-006 components self-declare visual styles > SPEC-uic-006: ArtifactList wraps active rows in .artifact-list-active-row and archived rows in .artifact-list-archived-row` — ArtifactList wraps each active and archived row in its own self-styled container element.
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-006 components self-declare visual styles > SPEC-uic-006: .artifact-list-active-row declares its own background in ArtifactList.css` — the active-row wrapper class declares its own background in the component CSS rather than inheriting it.

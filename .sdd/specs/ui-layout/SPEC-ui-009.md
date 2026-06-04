---
id: SPEC-ui-009
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "148addf6"
---

# SPEC-ui-009 — Plugin reference entry is pinned to the bottom of the sidenav

The plugin reference navigation entry sits at the very bottom of the sidenav, pinned to the bottom edge. It does not scroll with the workspace list or NAVIGATE section above it. A hairline separator visually divides it from the NAVIGATE section. It is always visible regardless of how many workspaces or nav items are above it.

**Tests:**

- `hub/client/src/spec-ui.test.tsx > SPEC-ui-009 — plugin reference pinned to sidenav bottom > SPEC-ui-009: plugin-ref section is a direct child of the sidenav, outside the scroll container` — "Plugin-reference section is pinned outside the scrollable region as a direct sidenav child."
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-009 — plugin reference pinned to sidenav bottom > SPEC-ui-009: plugin reference row renders regardless of whether a workspace is active` — "Plugin-reference entry stays visible whether or not a workspace is active."

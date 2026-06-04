---
id: SPEC-ui-007
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "fa5a7426"
---

# SPEC-ui-007 — Workspace selector is a dropdown in the sidenav

The active workspace row in the sidenav WORKSPACE section is a dropdown trigger showing the live/idle dot, workspace name, alert badge, and a `▴` chevron. Clicking it opens a dropdown panel listing all workspaces (dot, name, path in mono, alert badge; active row has 2 px accent left border) with a "+ attach workspace" row at the bottom. Clicking outside closes it. Clicking a workspace selects it and closes the panel.

**Tests:**

- `hub/client/src/spec-ui.test.tsx > SPEC-ui-007 — workspace selector dropdown > SPEC-ui-007: clicking the trigger opens a panel listing workspaces and an attach row` — "Clicking the workspace trigger opens a panel of workspaces with an attach row."
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-007 — workspace selector dropdown > SPEC-ui-007: clicking a workspace row selects it and closes the panel` — "Selecting a workspace from the panel activates it and dismisses the dropdown."

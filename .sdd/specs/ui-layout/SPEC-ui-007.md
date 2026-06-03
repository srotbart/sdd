---
id: SPEC-ui-007
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "d9f054be"
---

# SPEC-ui-007 — Workspace selector is a dropdown in the sidenav

The active workspace row in the sidenav WORKSPACE section is a dropdown trigger showing the live/idle dot, workspace name, alert badge, and a `▴` chevron. Clicking it opens a dropdown panel listing all workspaces (dot, name, path in mono, alert badge; active row has 2 px accent left border) with a "+ attach workspace" row at the bottom. Clicking outside closes it. Clicking a workspace selects it and closes the panel.

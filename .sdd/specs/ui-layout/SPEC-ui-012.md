---
id: SPEC-ui-012
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "78fc01ba"
---

# SPEC-ui-012 — Sidenav and main content show an empty state when no workspaces are attached

When `workspaces.length === 0`, the WORKSPACE section of the sidenav shows only the `+ attach workspace` affordance (no workspace rows, no dropdown). The NAVIGATE section is hidden (SPEC-ui-011). The main content area shows a centred empty-state prompt: "No workspace attached — use the sidenav to attach a project folder." The Dashboard tile grid is not rendered.

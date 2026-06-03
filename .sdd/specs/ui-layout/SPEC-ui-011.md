---
id: SPEC-ui-011
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "fdd76d23"
---

# SPEC-ui-011 — Sidenav NAVIGATE section renders only when a workspace is active

The NAVIGATE section of the sidenav (tab rows for session, targets, specs, gaps, work items, settings, plugin reference) is conditionally rendered only when `activeWorkspaceId` is truthy. When no workspace is selected — such as when the Hub Dashboard is the active view — the NAVIGATE section is hidden entirely. This conditional is a structural requirement, not a visual state.

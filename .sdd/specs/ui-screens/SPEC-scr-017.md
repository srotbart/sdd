---
id: SPEC-scr-017
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "d2605eb7"
---

# SPEC-scr-017 — Plugin Reference screen accessible from the sidenav

A `PluginReference` screen exists and is reachable via a permanent entry at the bottom of the sidenav, visually separated from workspace-scoped navigation and always visible. Toolbar: `❡ plugin reference — SDD workflow, artifacts, and skills` with a `view source on github ↗` ghost button. Layout: 220px left TOC sidebar + scrollable right content pane. The TOC has 7 sections (Overview, Pipeline, Artifacts, Status lifecycles, Skills, Schemas, Design decisions) with a scroll-spy that highlights the active section. Content matches the design's `plugin-reference.jsx` exactly: pipeline ASCII diagram, artifact cards, skill-card rows, schema pre blocks, lifecycle table, design decisions list.

**Tests:**
- `hub/client/src/App.test.tsx > Sidenav plugin reference entry (WI-scr-008) > renders 'plugin reference' sidenav entry when no workspace is active` — "Plugin reference entry is always visible in the sidenav"
- `hub/client/src/screens/PluginReference.test.tsx > PluginReference screen (WI-scr-008) > renders all 7 TOC section headings` — "Plugin reference screen renders all 7 TOC sections"
- `hub/client/src/screens/PluginReference.test.tsx > PluginReference screen (WI-scr-008) > renders the 'view source on github ↗' ghost button link` — "Plugin reference toolbar has the github source link"

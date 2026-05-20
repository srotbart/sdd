---
id: WI-scr-008
gap-id: GAP-scr-008
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Create PluginReference screen and add permanent sidenav entry

**Scope:** `hub/client/src/screens/PluginReference.tsx` (new file) and `hub/client/src/components/Sidenav.tsx` — create the PluginReference screen with: toolbar (`❡ plugin reference — SDD workflow, artifacts, and skills` + `view source on github ↗` ghost button), 220px left TOC sidebar with 7 sections and scroll-spy, scrollable right content pane matching `plugin-reference.jsx` design (pipeline ASCII diagram, artifact cards, skill-card rows, schema pre blocks, lifecycle table, design decisions list); add a permanent sidenav entry below workspace-scoped navigation.

**Acceptance criteria:**
- `PluginReference.tsx` component exists and renders without errors
- Sidenav has a permanent "plugin reference" entry visible regardless of active workspace
- TOC has 7 sections: Overview, Pipeline, Artifacts, Status lifecycles, Skills, Schemas, Design decisions
- Scroll-spy highlights the active TOC section as user scrolls
- `view source on github ↗` ghost button is present in the toolbar
- Test: render `<PluginReference>` and assert all 7 TOC section headings are present in the DOM
- Test: sidenav renders "plugin reference" entry when no workspace is active

---
id: SPEC-scr-020
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "f1c98062"
---

# SPEC-scr-020 — Gaps screen fetches live data and shows archived section

`App.tsx` fetches `GET /workspaces/:id/gaps` when the active workspace ID changes and passes the result to the `Gaps` component, replacing mock data. The Gaps list splits into active (`open`) and archived (`closed`, `deferred`, `accepted`) sections. Active gaps appear first; a collapsible eyebrow divider (same style as SPEC-scr-015 — `· ARCHIVED N ·` with flanking `<hr>`, `letter-spacing: 0.18em`, `font-weight: 500`, ▾/▸ toggle) separates them from archived gaps. Archived rows use `opacity: 0.55` (0.85 on hover). The domain filter applies to both sections.

**Tests:**
- `hub/client/src/App.test.tsx > App gaps and work-items data wiring (WI-scr-016) > fetches /workspaces/:id/gaps after selecting a workspace` — "App fetches gaps from the backend when a workspace is selected"
- `hub/client/src/screens/Gaps.test.tsx > Gaps — active and archived sections via ArtifactList > shows the ArtifactList divider when closed gaps exist` — "Gaps screen shows an archived-section divider when closed gaps exist"

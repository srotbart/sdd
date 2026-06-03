---
id: SPEC-scr-005
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "6ec1be3d"
---

# SPEC-scr-005 — Workspace Gaps screen

`client/src/screens/Gaps.tsx` is a two-pane layout: a left list (~420 px) with a horizontally-scrollable domain filter bar and one row per gap showing ID + status pill + optional WI closer pill, serif title, mono path:line, and a metadata footer. The right pane shows gap detail: header with ID + status + action button or WI link + serif title; a two-column layout with main area (location, reasoning, code context with syntax highlighting and highlighted offending line) and a right rail (linked spec item card, audit metadata, linked work-item card if present).

**Tests:**
- `hub/client/src/screens/Gaps.test.tsx > Gaps — active and archived sections via ArtifactList > renders active gap rows in the list` — "Gaps screen renders open gap rows in the left list"
- `hub/client/src/screens/Gaps.test.tsx > Gaps — active and archived sections via ArtifactList > renders archived (closed) gap rows in the list` — "Gaps screen renders closed gap rows in the archived section"

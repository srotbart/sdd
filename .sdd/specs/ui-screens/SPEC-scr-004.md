---
id: SPEC-scr-004
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "bad0d226"
---

# SPEC-scr-004 — Workspace Specs screen

`client/src/screens/Specs.tsx` is a two-pane layout: a left domain list (~220 px) with name and version hash per domain, and a right pane showing all active spec items for the selected domain — each item has an ID line (mono accent ID, active pill, open-gap pill if applicable, aliases), a Newsreader title, body paragraph, and ref pills linking to related GAP and WI IDs.

**Tests:**
- `hub/client/src/screens/Specs.test.tsx > Specs screen fuzzy search (SPEC-scr-036) > renders a search input above the item list` — "Specs screen renders the two-pane layout with domain sidebar and item list"
- `hub/client/src/screens/Specs.test.tsx > Specs screen item detail view (SPEC-scr-037) > domain sidebar remains visible in the detail view` — "Domain sidebar stays visible when switching views"

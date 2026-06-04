---
id: SPEC-ui-016
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "267ffaa2"
---

# SPEC-ui-016 — AttachWorkspaceDialog recent folders are sourced from a live API call

The RECENT FOLDERS section is populated by fetching `GET /recent-workspaces` on dialog open, which returns the most recently attached workspace paths with their names and SDD status. Hardcoded mock data is not permitted. If the fetch fails or returns an empty list, the RECENT FOLDERS section is hidden.

**Tests:**

- `hub/client/src/spec-ui.test.tsx > SPEC-ui-016 — recent folders sourced from GET /recent-workspaces > SPEC-ui-016: dialog open fetches /recent-workspaces and lists returned paths` — "Opening the dialog fetches recent workspaces and lists the returned paths."
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-016 — recent folders sourced from GET /recent-workspaces > SPEC-ui-016: an empty /recent-workspaces response hides the RECENT FOLDERS section` — "An empty recent-workspaces response hides the recent folders section."

---
id: SPEC-ui-016
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "c7fa69f7"
---

# SPEC-ui-016 — AttachWorkspaceDialog recent folders are sourced from a live API call

The RECENT FOLDERS section is populated by fetching `GET /recent-workspaces` on dialog open, which returns the most recently attached workspace paths with their names and SDD status. Hardcoded mock data is not permitted. If the fetch fails or returns an empty list, the RECENT FOLDERS section is hidden.

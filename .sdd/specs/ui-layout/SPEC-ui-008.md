---
id: SPEC-ui-008
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "b44b67c7"
---

# SPEC-ui-008 — Attach Workspace modal dialog

Clicking the `+` button or the "+ attach workspace" dropdown row opens a modal dialog: Newsreader italic title *Attach workspace*, hairline separator, PROJECT LOCATION section with a full-width path input and a `browse…` ghost link, RECENT FOLDERS section (paper-2 card) listing recently seen paths with description and a `● FRESH` / `● SDD READY` status chip. Footer has an Esc-to-cancel hint, `cancel` ghost button, and a solid `attach workspace` primary button. Escape and backdrop click close the dialog. On submit calls `POST /workspaces` with `{ name, path }`.

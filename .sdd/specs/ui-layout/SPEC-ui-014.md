---
id: SPEC-ui-014
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "fda7027d"
---

# SPEC-ui-014 — AttachWorkspaceDialog includes name and description fields

The dialog collects three fields: `path` (required, full filesystem path), `name` (required, auto-derived from the path's basename but editable by the user), and `description` (optional, free text). All three are included in the `POST /workspaces` body on submit. An empty `description` is sent as `null`. The `name` field updates automatically when `path` changes but can be overridden by the user.

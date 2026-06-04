---
id: SPEC-ui-014
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "f4404a42"
---

# SPEC-ui-014 — AttachWorkspaceDialog includes name and description fields

The dialog collects three fields: `path` (required, full filesystem path), `name` (required, auto-derived from the path's basename but editable by the user), and `description` (optional, free text). All three are included in the `POST /workspaces` body on submit. An empty `description` is sent as `null`. The `name` field updates automatically when `path` changes but can be overridden by the user.

**Tests:**

- `hub/client/src/spec-ui.test.tsx > SPEC-ui-014 — dialog collects name and description fields > SPEC-ui-014: name auto-derives from the path basename and a description field appears` — "Name auto-fills from the path basename and a description field is offered."
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-014 — dialog collects name and description fields > SPEC-ui-014: user edit to name overrides the auto-derived basename` — "A user-edited name is preserved even when the path changes afterward."

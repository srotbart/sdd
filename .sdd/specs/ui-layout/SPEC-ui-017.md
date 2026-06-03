---
id: SPEC-ui-017
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "cecc5367"
---

# SPEC-ui-017 — AttachWorkspaceDialog POST body includes name, path, and description

On submit, `AttachWorkspaceDialog` sends `POST /workspaces` with body `{ name: string, path: string, description: string | null }`. All three fields are always present in the body. The description field must not be collected from the user and then silently omitted from the request.

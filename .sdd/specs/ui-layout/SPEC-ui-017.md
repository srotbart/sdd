---
id: SPEC-ui-017
domain: ui-layout
abbrev: ui
status: active
aliases: []
version: "8444ce16"
---

# SPEC-ui-017 — AttachWorkspaceDialog POST body includes name, path, and description

On submit, `AttachWorkspaceDialog` sends `POST /workspaces` with body `{ name: string, path: string, description: string | null }`. All three fields are always present in the body. The description field must not be collected from the user and then silently omitted from the request.

**Tests:**

- `hub/client/src/spec-ui.test.tsx > SPEC-ui-017 — POST /workspaces body includes name, path, description > SPEC-ui-017: submit with a description sends { name, path, description } all present` — "Submitting with a description POSTs all three fields populated."
- `hub/client/src/spec-ui.test.tsx > SPEC-ui-017 — POST /workspaces body includes name, path, description > SPEC-ui-017: submit with empty description sends description: null (field still present)` — "Submitting without a description still sends the description key as null."

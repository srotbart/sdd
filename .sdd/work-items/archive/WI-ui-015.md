---
id: WI-ui-015
gap-id: GAP-ui-015
domain: ui-layout
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Include description in POST /workspaces body sent by AttachWorkspaceDialog

**Scope:** `hub/client/src/components/AttachWorkspaceDialog.tsx:78` — add `description: desc.trim() || null` to the `JSON.stringify` body in `handleSubmit`

**Acceptance criteria:**
- POST body includes `description` field (non-empty string or `null`)
- Empty description is sent as `null`, not as an empty string
- `name` and `path` fields remain unchanged
- Unit test: submitting with a description sends `{ name, path, description: "the desc" }`
- Unit test: submitting with empty description sends `{ name, path, description: null }`

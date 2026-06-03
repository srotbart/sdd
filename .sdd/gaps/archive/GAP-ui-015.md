---
id: GAP-ui-015
spec-item: SPEC-ui-017
domain: ui-layout
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "78abf73e"
closed-by: WI-ui-015
deferred-reason: null
---

# Gap: POST /workspaces body omits description — desc field collected but never sent

**Location:** `hub/client/src/components/AttachWorkspaceDialog.tsx:78`

**Reasoning:** `handleSubmit` sends `JSON.stringify({ name: name.trim(), path: trimmed })` without `description`, silently dropping the `desc` state that was collected from the user, violating SPEC-ui-017.

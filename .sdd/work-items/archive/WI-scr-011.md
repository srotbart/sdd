---
id: WI-scr-011
gap-id: GAP-scr-011
domain: ui-screens
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Replace save button with blur-persisting in Settings screen

**Scope:** `hub/client/src/screens/Settings.tsx` — remove the explicit `save` button and `handleSave`/`dirty` logic; add `onBlur` handlers to the name, path, and description inputs that each call `PATCH /workspaces/:id` immediately with the changed field.

**Acceptance criteria:**
- No explicit save button is rendered in the Settings screen
- Blurring the name, path, or description input immediately fires `PATCH /workspaces/:id` with the updated field
- Each field persists independently on blur (not all fields together)
- Visual test: settings form has no save button; tabbing away from a field persists the change without any button click

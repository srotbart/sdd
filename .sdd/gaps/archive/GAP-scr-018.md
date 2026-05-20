---
id: GAP-scr-018
spec-item: SPEC-scr-022
domain: ui-screens
status: closed
discovered: "2026-05-17T10:00:00Z"
audit-spec-version: "f2c40fbafdb2f910a078d2f887038a7692e4dd53"
closed-by: WI-scr-017
deferred-reason: null
---

# Gap: Selected workspace ID is not persisted to localStorage

**Locations:**
- `hub/client/src/App.tsx:195`
- `hub/client/src/App.tsx:267`

**Reasoning:** `useState<string | null>(null)` initialises with a hardcoded `null` — no `localStorage.getItem('hub.activeWorkspaceId')` read on mount; `handleSelectWorkspace` updates React state but never calls `localStorage.setItem('hub.activeWorkspaceId', id)`, so the selection is lost on page reload.

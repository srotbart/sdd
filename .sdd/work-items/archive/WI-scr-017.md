---
id: WI-scr-017
gap-id: GAP-scr-018
domain: ui-screens
status: done
created: "2026-05-17T10:00:00Z"
abandoned-reason: null
---

# Work Item: Persist active workspace ID to localStorage in App.tsx

**Scope:** `hub/client/src/App.tsx` — initialise `activeWorkspaceId` from `localStorage.getItem('hub.activeWorkspaceId')` and write the key on workspace selection; fall back to first workspace when persisted ID is absent or stale.

**Acceptance criteria:**
- `useState` initial value reads `localStorage.getItem('hub.activeWorkspaceId')` so the selection survives page reload
- `handleSelectWorkspace` calls `localStorage.setItem('hub.activeWorkspaceId', id)` whenever a workspace is selected
- `handleSelectHub` calls `localStorage.removeItem('hub.activeWorkspaceId')` (or sets it to empty) when the user returns to the hub view
- After workspaces are fetched, if the persisted ID is not present in the list, the app falls back to the first workspace (or null if the list is empty)
- Test: selecting a workspace writes `hub.activeWorkspaceId` to localStorage
- Test: on mount with a valid persisted ID, that workspace is pre-selected
- Test: on mount with a stale/absent persisted ID, the first workspace is selected

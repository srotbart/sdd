---
id: WI-ui-020
gap-id: GAP-ui-020
domain: ui-layout
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Fix hasSdd detection to check typed path via API, not only recentFolders

**Scope:** `hub/client/src/components/AttachWorkspaceDialog.tsx:54-56` — when the user types a path not in `recentFolders`, fetch `GET /recent-workspaces` or a dedicated endpoint to detect whether `.sdd/` exists at the typed path, rather than treating all unmatched paths as `hasSdd: false`.

**Acceptance criteria:**
- Typing a path that is not in `recentFolders` triggers a debounced check against the server (using the existing `GET /recent-workspaces` `hasSdd` field or a new endpoint)
- A path that has `.sdd/` shows "Existing `.sdd/` detected" even when not in the recent list
- A path without `.sdd/` shows the "No `.sdd/` here yet" + command peek state
- Unit test: component fetches sdd-status when path changes to a value not in recent folders
- Unit test: when server reports `hasSdd: true` for the typed path, preview shows "Existing `.sdd/` detected"

---
id: WI-arch-009
gap-id: GAP-arch-012
domain: architecture
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add GET /browse-folder endpoint and wire browse… button

**Scope:** `server/index.ts` + `client/src/components/AttachWorkspaceDialog.tsx` — add osascript folder-picker endpoint; call it from the browse… button and populate the path input

**Acceptance criteria:**
- `GET /browse-folder` spawns `osascript -e 'POSIX path of (choose folder)'` and returns `{ path: "/absolute/path" }` on selection
- Returns `{ path: null }` when the user cancels (osascript exits non-zero)
- Returns 500 with an error message if osascript is unavailable
- The browse… button in the dialog calls `GET /browse-folder`, and on success sets the path input to the returned path
- While the picker is open the browse… button shows a loading state
- Test: GET /browse-folder with osascript mocked to return a path returns { path } with the POSIX path

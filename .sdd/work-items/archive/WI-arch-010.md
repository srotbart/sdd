---
id: WI-arch-010
gap-id: GAP-arch-013
domain: architecture
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Fetch workspace list from GET /workspaces in App.tsx

**Scope:** `client/src/App.tsx` — replace MOCK_WORKSPACES with a useEffect that calls GET /workspaces on mount and after attach; pass live data to Sidenav

**Acceptance criteria:**
- On mount, App fetches GET /workspaces and stores the result in state
- After a workspace is attached (onWorkspaceAttached), the list is re-fetched
- MOCK_WORKSPACES constant is removed
- Sidenav receives the live workspace list
- While loading, sidenav shows an empty or loading state without crashing
- Test: fetching returns an empty array renders sidenav with no workspace rows and no errors

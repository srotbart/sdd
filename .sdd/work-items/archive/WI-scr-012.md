---
id: WI-scr-012
gap-id: GAP-scr-012
domain: ui-screens
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Wire Targets screen to live backend data

**Scope:** `hub/client/src/App.tsx` — add `liveTargets` state and a `useEffect` that fetches `GET /workspaces/:id/targets` whenever `activeWorkspaceId` changes (mirroring the existing `liveSpecs` pattern); pass `liveTargets` to `<Targets>` and `<Session>` instead of `MOCK_TARGETS`.

**Acceptance criteria:**
- `App.tsx` fetches `/workspaces/:id/targets` when a workspace becomes active
- `<Targets>` receives the fetched data, not `MOCK_TARGETS`
- `<Session>` also receives the fetched data, not `MOCK_TARGETS`
- Fetch resets to empty array when no workspace is active
- Unit test: `liveTargets` state is populated from the API response and passed to `Targets`

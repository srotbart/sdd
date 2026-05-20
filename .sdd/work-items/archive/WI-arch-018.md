---
id: WI-arch-018
gap-id: GAP-arch-020
domain: architecture
status: done
created: "2026-05-18T00:00:00Z"
abandoned-reason: null
---

# Work Item: Handle sdd-changed messages in UI client and re-fetch affected endpoint

**Scope:** `hub/client/src/App.tsx` — add a `ws.onmessage` handler to the existing WebSocket `useEffect` (line 279) that listens for `{ type: "sdd-changed", workspaceId, artifact }` messages and, when the `workspaceId` matches `activeWorkspaceId`, re-fetches the corresponding endpoint (`GET /workspaces/:id/{artifact}`) and updates the matching live state (`liveTargets`, `liveSpecs`, `liveGaps`, or `liveWorkItems`) without a full page reload.

**Acceptance criteria:**
- `ws.onmessage` is wired in the existing WebSocket `useEffect`; no additional WebSocket connection is opened
- Receiving `{ type: "sdd-changed", workspaceId: activeWorkspaceId, artifact: "targets" }` triggers a re-fetch of `/workspaces/:id/targets` and updates `liveTargets`
- Same behaviour for `specs`, `gaps`, and `work-items`
- Messages with a `workspaceId` that does not match `activeWorkspaceId` are ignored
- Non-`sdd-changed` message types (e.g. `snapshot`, `update`) are not affected by this change
- Unit/integration test: receiving a `sdd-changed` message causes the correct fetch call and state update for each of the four artifact types

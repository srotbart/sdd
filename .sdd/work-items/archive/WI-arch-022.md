---
id: WI-arch-022
gap-id: [GAP-arch-022, GAP-arch-023]
domain: architecture
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Rewrite client WebSocket effect to handle all five message types with exponential-backoff reconnect

**Scope:** `hub/client/src/App.tsx` — rewrite the `useEffect` at lines 283–321 to: (1) route all five message types (`snapshot`, `update`, `sdd-changed`, `agent-registered`, `activity`) updating the appropriate state; (2) implement exponential-backoff reconnect on close (start 1s, double, cap 30s, no max retries)

**Acceptance criteria:**
- `snapshot` and `update` messages update `workspaces` state from payload
- `agent-registered` message is handled without error
- `activity` message is handled without error
- `sdd-changed` routing works as before
- On disconnect, client retries with delays 1s → 2s → 4s → … → 30s (capped)
- Reconnect timer is cleared on component unmount
- Unit/integration test: mock WS server sends snapshot and verifies workspaces state is updated
- Unit test: close event triggers reconnect attempt after 1s delay

---
id: WI-arch-005
gap-id: GAP-arch-005
domain: architecture
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Implement WebSocket endpoint for UI clients

**Scope:** `server/ws-ui.ts` — attach a WebSocket server to the HTTP server; send a full state snapshot on connection and broadcast typed update events on state changes

**Acceptance criteria:**
- UI clients can connect via WebSocket and receive an initial state snapshot as a JSON message
- When a watched `.sdd/` file changes, a typed update message is broadcast to all connected UI clients within 500 ms of the debounced event
- Disconnected clients are removed from the broadcast set without crashing the server
- Test: connecting a mock WebSocket client receives a valid state snapshot on open

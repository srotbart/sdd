---
id: SPEC-arch-027
domain: architecture
abbrev: arch
status: active
aliases: []
version: "d0d72fdd"
---

# SPEC-arch-027 — WebSocket client reconnects with exponential backoff after disconnection

When the UI client's WebSocket connection closes (for any reason other than intentional page unload), the client attempts to reconnect using exponential backoff: initial delay 1 s, doubling on each failure, capped at 30 s. The hub-connected indicator in the header reflects the current connection state. No maximum retry count is imposed — the client retries indefinitely until the server is reachable.

**Tests:**
hub/client/src/spec-arch-client.test.tsx > SPEC-arch-027: WebSocket client reconnects with exponential backoff > SPEC-arch-027: a close event triggers a reconnect (new WebSocket constructed) — "a closed connection triggers an automatic reconnect"
hub/client/src/spec-arch-client.test.tsx > SPEC-arch-027: WebSocket client reconnects with exponential backoff > SPEC-arch-027: backoff config is initial 1s, doubling, capped at 30s — "reconnect backoff starts at 1s, doubles, and caps at 30s"
hub/client/src/spec-arch-client.test.tsx > SPEC-arch-027: WebSocket client reconnects with exponential backoff > SPEC-arch-027: reconnect timer is cleared on unmount (no further reconnect) — "the reconnect timer is cleared on unmount"

---
id: SPEC-arch-027
domain: architecture
abbrev: arch
status: active
aliases: []
version: "46c8ef90"
---

# SPEC-arch-027 — WebSocket client reconnects with exponential backoff after disconnection

When the UI client's WebSocket connection closes (for any reason other than intentional page unload), the client attempts to reconnect using exponential backoff: initial delay 1 s, doubling on each failure, capped at 30 s. The hub-connected indicator in the header reflects the current connection state. No maximum retry count is imposed — the client retries indefinitely until the server is reachable.

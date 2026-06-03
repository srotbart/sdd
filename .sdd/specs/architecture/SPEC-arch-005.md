---
id: SPEC-arch-005
domain: architecture
abbrev: arch
status: active
aliases: []
version: "bad92cab"
---

# SPEC-arch-005 — Server exposes a WebSocket endpoint for UI clients

The hub server maintains a WebSocket endpoint that UI browser clients connect to for real-time state push. On connection, the server sends a full state snapshot; subsequent messages are typed update events (artifact changed, agent status changed, etc.).

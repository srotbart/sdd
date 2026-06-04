---
id: SPEC-arch-005
domain: architecture
abbrev: arch
status: active
aliases: []
version: "6a417efb"
---

# SPEC-arch-005 — Server exposes a WebSocket endpoint for UI clients

The hub server maintains a WebSocket endpoint that UI browser clients connect to for real-time state push. On connection, the server sends a full state snapshot; subsequent messages are typed update events (artifact changed, agent status changed, etc.).

**Tests:**
hub/server/spec-arch-ws.test.ts > SPEC-arch-005/036: UI WebSocket endpoint sends enriched snapshot on connect > SPEC-arch-005: sends a full snapshot message immediately on connection — "a UI client receives a full snapshot message as soon as it connects"

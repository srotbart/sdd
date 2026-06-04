---
id: SPEC-arch-006
domain: architecture
abbrev: arch
status: active
aliases: []
version: "f255ecb8"
---

# SPEC-arch-006 — Server accepts WebSocket connections from Claude Code agents

Claude Code agent processes connect to the hub server over WebSocket to register, send heartbeats, and emit structured activity events (file edits, test runs, work-item state transitions). The server tracks connected agents per workspace with status (idle/busy), last-heartbeat, pid, and host.

**Tests:**
hub/server/spec-arch-ws.test.ts > SPEC-arch-006/028: agent WebSocket registration > SPEC-arch-006: an agent connects on /agents and registers with idle status, pid and host — "a Claude Code agent connects over WebSocket and is registered with idle status, pid and host"

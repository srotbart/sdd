---
id: SPEC-arch-006
domain: architecture
abbrev: arch
status: active
aliases: []
version: "84b8983d"
---

# SPEC-arch-006 — Server accepts WebSocket connections from Claude Code agents

Claude Code agent processes connect to the hub server over WebSocket to register, send heartbeats, and emit structured activity events (file edits, test runs, work-item state transitions). The server tracks connected agents per workspace with status (idle/busy), last-heartbeat, pid, and host.

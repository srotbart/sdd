---
id: WI-arch-006
gap-id: GAP-arch-006
domain: architecture
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Implement agent WebSocket connection handler

**Scope:** `server/ws-agent.ts` — accept WebSocket connections from Claude Code agents; handle registration, heartbeats, and structured activity events; track agent registry (status, last-heartbeat, pid, host) in SQLite

**Acceptance criteria:**
- Agent connects with a registration message (workspace, pid, host) and is recorded in the agent registry
- Heartbeat messages update the agent's `last-heartbeat` timestamp
- Activity event messages (file edit, test run, work-item state) are stored and broadcast to UI clients
- Agent disconnects remove it from the active registry without crashing the server
- Test: mock agent sends registration + heartbeat; registry reflects correct status and last-heartbeat

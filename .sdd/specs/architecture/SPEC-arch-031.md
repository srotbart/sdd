---
id: SPEC-arch-031
domain: architecture
abbrev: arch
status: active
aliases: []
version: "53e92ab0"
---

# SPEC-arch-031 — Client maintains liveAgents state from WebSocket; MOCK_AGENTS is removed

`App.tsx` maintains a `liveAgents: Agent[]` state variable populated from `snapshot` and `update` WebSocket messages (SPEC-arch-026). All screens that previously received `MOCK_AGENTS` (Dashboard, Session, WorkItems, Activity, Header) are wired to `liveAgents` instead. The `MOCK_AGENTS` constant is deleted. The Header's `agentCount` reflects `liveAgents.length`.

**Tests:**
hub/client/src/spec-arch-client.test.tsx > SPEC-arch-031: client maintains liveAgents state from WebSocket > SPEC-arch-031: liveAgents from a snapshot drive the Header agent count — "liveAgents from a WebSocket snapshot drive the header agent count"
hub/client/src/spec-arch-client.test.tsx > SPEC-arch-031: client maintains liveAgents state from WebSocket > SPEC-arch-031: MOCK_AGENTS / MOCK_WORKSPACES constants are not present in App.tsx source — "the mock agent/workspace constants have been removed from App"

---
id: SPEC-arch-031
domain: architecture
abbrev: arch
status: active
aliases: []
version: "34ada0ca"
---

# SPEC-arch-031 — Client maintains liveAgents state from WebSocket; MOCK_AGENTS is removed

`App.tsx` maintains a `liveAgents: Agent[]` state variable populated from `snapshot` and `update` WebSocket messages (SPEC-arch-026). All screens that previously received `MOCK_AGENTS` (Dashboard, Session, WorkItems, Activity, Header) are wired to `liveAgents` instead. The `MOCK_AGENTS` constant is deleted. The Header's `agentCount` reflects `liveAgents.length`.

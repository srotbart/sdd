---
id: WI-arch-025
gap-id: GAP-arch-027
domain: architecture
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Replace MOCK_AGENTS with liveAgents state populated from WebSocket

**Scope:** `hub/client/src/App.tsx` — (1) add `liveAgents: Agent[]` state; (2) populate it from `snapshot` and `update` WebSocket messages (in WI-arch-022's rewrite); (3) delete `MOCK_AGENTS` constant; (4) pass `liveAgents` to Dashboard, Session, WorkItems, Activity; (5) set Header `agentCount` from `liveAgents.length`

**Acceptance criteria:**
- `MOCK_AGENTS` constant is deleted from App.tsx
- Dashboard, Session, WorkItems, Activity, Header receive live agent data
- Header `agentCount` reflects `liveAgents.length`
- `agent-registered` message appends the new agent to `liveAgents`
- Unit test: `snapshot` message sets `liveAgents` to the agents array from payload
- Unit test: `update` message updates `liveAgents`

---
id: WI-arch-034
gap-id: GAP-arch-037
domain: architecture
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Change liveAgents state from Record to Agent array

**Scope:** `hub/client/src/App.tsx:152` — change `useState<Record<string, Agent>>({})` to `useState<Agent[]>([])`, update the WebSocket message handler to set the array directly, and update all consumer call-sites that currently receive the Record type.

**Acceptance criteria:**
- `liveAgents` is declared as `Agent[]` not `Record<string, Agent>`
- WebSocket `snapshot` and `update` handlers set `liveAgents` to the array from `m.agents` directly
- All screens (Dashboard, Session, WorkItems, Activity) and Header receive `Agent[]`
- `agentCount` in Header uses `liveAgents.length` not `Object.values(liveAgents).length`
- TypeScript compiles with no type errors
- Existing `App.test.tsx` passes

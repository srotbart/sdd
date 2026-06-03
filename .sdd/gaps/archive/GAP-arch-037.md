---
id: GAP-arch-037
spec-item: SPEC-arch-031
domain: architecture
status: closed
discovered: "2026-05-27T00:00:00Z"
audit-spec-version: "5aca4dd3"
closed-by: WI-arch-034
deferred-reason: null
---

# Gap: liveAgents state uses Record<string, Agent> instead of Agent[]

**Location:** `hub/client/src/App.tsx:152`

**Reasoning:** The spec prescribes `liveAgents: Agent[]` but the implementation declares `useState<Record<string, Agent>>({})` and passes an indexed object (not an array) to all consumer screens.

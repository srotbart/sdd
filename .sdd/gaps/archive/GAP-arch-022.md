---
id: GAP-arch-022
spec-item: SPEC-arch-026
domain: architecture
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "6165d585"
closed-by: WI-arch-022
deferred-reason: null
---

# Gap: Client WebSocket handler only processes sdd-changed, ignores snapshot/update/agent-registered/activity

**Location:** `hub/client/src/App.tsx:289-319`

**Reasoning:** The `onmessage` handler checks only for `type === "sdd-changed"` and returns for all other message types without updating workspace or agent state, violating SPEC-arch-026's requirement to process all five message types.

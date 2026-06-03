---
id: GAP-arch-027
spec-item: SPEC-arch-031
domain: architecture
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "6165d585"
closed-by: WI-arch-025
deferred-reason: null
---

# Gap: MOCK_AGENTS constant still present and used in place of liveAgents from WebSocket

**Locations:**
- `hub/client/src/App.tsx:127-131`
- `hub/client/src/App.tsx:410`
- `hub/client/src/App.tsx:419`
- `hub/client/src/App.tsx:427`
- `hub/client/src/App.tsx:429`
- `hub/client/src/App.tsx:441`

**Reasoning:** `MOCK_AGENTS` is defined and passed to Dashboard, Session, WorkItems, Activity, and Header instead of a `liveAgents` state populated from WebSocket messages, violating SPEC-arch-031.

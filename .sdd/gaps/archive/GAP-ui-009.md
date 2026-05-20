---
id: GAP-ui-009
spec-item: SPEC-ui-002
domain: ui-layout
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "e0a2c55c"
closed-by: WI-ui-009
deferred-reason: null
---

# Gap: Hub overview dot hardcoded to idle, never reflects live connectivity

**Location:** `hub/client/src/components/Sidenav.tsx:76`

**Reasoning:** The hub overview row's dot is unconditionally assigned `sidenav-dot--idle`; no WebSocket connection state is tracked or passed to Sidenav, so the live/idle dot the spec requires cannot reflect actual hub connectivity.

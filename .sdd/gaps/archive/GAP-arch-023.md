---
id: GAP-arch-023
spec-item: SPEC-arch-027
domain: architecture
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "6165d585"
closed-by: WI-arch-022
deferred-reason: null
---

# Gap: WebSocket client has no reconnect logic — disconnection is final

**Location:** `hub/client/src/App.tsx:284-321`

**Reasoning:** On `ws.onclose` the handler only sets `hubConnected(false)` with no retry; SPEC-arch-027 requires exponential backoff reconnection starting at 1s, doubling, capped at 30s.

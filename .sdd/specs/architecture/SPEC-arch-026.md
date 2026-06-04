---
id: SPEC-arch-026
domain: architecture
abbrev: arch
status: active
aliases: []
version: "97bc1249"
---

# SPEC-arch-026 — Client WebSocket handler processes snapshot and update messages to update live state

The UI client's WebSocket `onmessage` handler processes all five message types defined in SPEC-arch-025. On `snapshot` and `update`, the client updates its live workspace list and live agent list from the message payload. The client must not drop unrecognized message types silently — unknown types are ignored without error. The REST fetch for workspaces on mount remains for initial load; WebSocket messages are additive updates thereafter.

**Tests:**
hub/client/src/spec-arch-client.test.tsx > SPEC-arch-026: client WebSocket handler processes snapshot and update messages > SPEC-arch-026: a snapshot message populates the live workspace list — "a snapshot message updates the client live workspace list"
hub/client/src/spec-arch-client.test.tsx > SPEC-arch-026: client WebSocket handler processes snapshot and update messages > SPEC-arch-026: an update message does not itself fetch artifact endpoints — "an update message updates state without fetching artifact endpoints"
hub/client/src/spec-arch-client.test.tsx > SPEC-arch-026: client WebSocket handler processes snapshot and update messages > SPEC-arch-026: an unrecognized message type is ignored without throwing — "unrecognized message types are ignored without error"

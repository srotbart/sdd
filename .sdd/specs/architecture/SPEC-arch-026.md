---
id: SPEC-arch-026
domain: architecture
abbrev: arch
status: active
aliases: []
version: "20ab50a5"
---

# SPEC-arch-026 — Client WebSocket handler processes snapshot and update messages to update live state

The UI client's WebSocket `onmessage` handler processes all five message types defined in SPEC-arch-025. On `snapshot` and `update`, the client updates its live workspace list and live agent list from the message payload. The client must not drop unrecognized message types silently — unknown types are ignored without error. The REST fetch for workspaces on mount remains for initial load; WebSocket messages are additive updates thereafter.

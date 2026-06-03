---
id: SPEC-arch-040
domain: architecture
abbrev: arch
status: active
aliases: []
version: "becd6751"
---

# SPEC-arch-040 — ArtifactStatus includes 'deferred' and 'abandoned'

The `ArtifactStatus` union type includes `'deferred'` (a terminal state for gaps that are intentionally deferred) and `'abandoned'` (a terminal state for work items that are cancelled). Both values are valid status strings in the SDD pipeline and must be representable in the type so that filtering logic (e.g., excluding deferred gaps from the open count, excluding abandoned work items from the active count) compiles correctly and executes as intended.

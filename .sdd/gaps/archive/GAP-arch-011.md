---
id: GAP-arch-011
spec-item: SPEC-arch-011
domain: architecture
status: closed
discovered: "2026-05-15T00:00:00Z"
audit-spec-version: "dad74d9b"
closed-by: WI-arch-008
deferred-reason: null
---

# Gap: PATCH /workspaces/:id endpoint does not exist

**Location:** server/index.ts — no route handler for PATCH /workspaces/:id

**Reasoning:** The HTTP server has no API routing layer; partial workspace updates cannot be persisted.

---
id: GAP-arch-010
spec-item: SPEC-arch-010
domain: architecture
status: closed
discovered: "2026-05-15T00:00:00Z"
audit-spec-version: "dad74d9b"
closed-by: WI-arch-008
deferred-reason: null
---

# Gap: GET /workspaces endpoint does not exist

**Location:** server/index.ts — no route handler for GET /workspaces

**Reasoning:** The HTTP server only serves static files; no JSON API routes are registered.

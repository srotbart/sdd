---
id: SPEC-arch-015
domain: architecture
abbrev: arch
status: active
aliases: []
version: "561eeeec"
---

# SPEC-arch-015 — GET /workspaces/:id/gaps returns parsed gap files as JSON

`GET /workspaces/:id/gaps` reads all gap files from `.sdd/gaps/` and `.sdd/gaps/archive/` within the workspace path and returns a JSON array. Each item includes: `id`, `specItem`, `domain`, `status`, `discovered`, `auditVersion` (from `audit-spec-version`), `closedBy` (from `closed-by`), `deferredReason` (from `deferred-reason`), `title` (from `# Gap:` heading), `location` (from `**Location:**` / `**Locations:**` body field), `reasoning` (from `**Reasoning:**` body field). The fetch is triggered whenever the active workspace ID changes.

**Tests:**
hub/server/spec-arch-http.test.ts > SPEC-arch-015: GET /workspaces/:id/gaps > SPEC-arch-015: returns parsed gaps with mapped fields (auditVersion, closedBy, location, reasoning) — "GET gaps returns parsed gaps with all mapped fields"
hub/server/spec-arch-http.test.ts > SPEC-arch-015: GET /workspaces/:id/gaps > SPEC-arch-015: returns 404 for an unknown workspace — "GET gaps returns 404 for an unknown workspace"

---
id: GAP-scr-037
spec-item: SPEC-scr-040
status: closed
discovered: "2026-06-01T00:00:00Z"
audit-spec-version: ee7deef0
closed-by: WI-scr-038
deferred-reason: null
---

# Hub backend has no projections endpoints

**Locations:**
- `hub/server/index.ts:126` (route dispatcher)

**Reasoning:** `GET /workspaces/:id/projections` and `GET /workspaces/:id/projections/:name` routes are absent from the server — no code path reads `.sdd/projections/*.md` files or returns their content.

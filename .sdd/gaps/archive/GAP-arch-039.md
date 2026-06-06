---
id: GAP-arch-039
spec-item: SPEC-arch-042
domain: architecture
status: closed
discovered: "2026-06-05T00:00:00Z"
audit-spec-version: "b4fb72b1"
closed-by: WI-arch-036
deferred-reason: null
---

# Gap: Projection comments endpoints (GET/PUT/DELETE) are not implemented in the Hub server

**Locations:**
- `hub/server/index.ts:291` — only `GET /workspaces/:id/projections/:name` exists; no `/comments` sub-path routes are present
- `hub/server/index.ts` — no handler for `GET /workspaces/:id/projections/:name/comments`, `PUT /workspaces/:id/projections/:name/comments`, or `DELETE /workspaces/:id/projections/:name/comments/:commentId`
- `hub/server/` — no test file covering projection comments endpoints

**Reasoning:** The co-located `.sdd/projections/<name>.comments.json` read/write/delete API specified by SPEC-arch-042 does not exist anywhere in the server codebase.

---
id: WI-scr-038
gap-id: GAP-scr-037
status: done
created: "2026-06-01T00:00:00Z"
abandoned-reason: null
---

# Add projections endpoints to Hub backend

**Scope:** `hub/server/index.ts` — add `GET /workspaces/:id/projections` and `GET /workspaces/:id/projections/:name` route handlers that read `.sdd/projections/*.md` files

**Acceptance criteria:**
- `GET /workspaces/:id/projections` returns a JSON array of `{ name: string, lastModified: string }` for each `.md` file in the workspace's `.sdd/projections/` directory
- `GET /workspaces/:id/projections/:name` returns the raw markdown string for `.sdd/projections/<name>.md`; responds 404 if the file does not exist
- Both routes are wired into the existing request dispatcher pattern
- Test: `GET /workspaces/:id/projections` returns the correct list with `name` and `lastModified` fields
- Test: `GET /workspaces/:id/projections/:name` returns file content; 404 for a nonexistent name

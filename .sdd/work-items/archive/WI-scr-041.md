---
id: WI-scr-041
gap-id: GAP-scr-040
status: done
created: "2026-06-01T00:00:00Z"
abandoned-reason: null
---

# WI-scr-041 — Add /designs backend endpoints and designs artifact entry

**Scope:** `hub/server/index.ts` and `hub/server/sdd-artifact.ts` — add `GET /workspaces/:id/designs` (lists `.sdd/design/` subdirectories containing `design.md`) and `GET /workspaces/:id/designs/:name` (returns raw markdown of `.sdd/design/<name>/design.md`); add `designs` entry to `SDD_ARTIFACT_DIRS`

**Acceptance criteria:**
- `GET /workspaces/:id/designs` returns an array of `{ name, lastModified }` for each subdirectory of `.sdd/design/` containing a `design.md`
- `GET /workspaces/:id/designs/:name` returns the raw markdown of `.sdd/design/<name>/design.md`; responds 404 when not found
- Both endpoints return empty array / 404 gracefully when `.sdd/design/` does not exist
- `resolveArtifact` returns `"designs"` for a path containing `.sdd/design/`
- Unit test: designs list endpoint returns correct `{ name, lastModified }` shape for a fixture directory
- Unit test: designs item endpoint returns 404 for a missing design
- Unit test: `resolveArtifact` maps `.sdd/design/foo/design.md` to `"designs"`

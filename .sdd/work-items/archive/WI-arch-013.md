---
id: WI-arch-013
gap-id: GAP-arch-016
domain: architecture
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Implement GET /workspaces/:id/targets endpoint

**Scope:** `hub/server/sdd-parser.ts` — add `parseTargets(sddPath)` function that reads `*.md` from `{sddPath}/targets/` excluding `archive/`, parses frontmatter (`id`, `status`, `created`, `domain`) and the Current statement body; `hub/server/index.ts` — add route handler for `GET /workspaces/:id/targets` mirroring the `/specs` handler.

**Acceptance criteria:**
- `GET /workspaces/:id/targets` returns 404 for an unknown workspace ID
- Returns an empty JSON array when the targets directory is absent or contains no files
- Returns a JSON array with `id`, `status`, `created`, `domain`, and `statement` fields for each non-archived target file
- Files inside `targets/archive/` are excluded from the response
- Response `Content-Type` is `application/json`
- Manual test: hitting the endpoint for a workspace whose `.sdd/targets/` has active target files returns the correct parsed objects

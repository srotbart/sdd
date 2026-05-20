---
id: WI-arch-015
gap-id: GAP-arch-018
domain: architecture
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Implement GET /workspaces/:id/gaps endpoint

**Scope:** `hub/server/sdd-parser.ts` — add `parseGaps` function that reads `.sdd/gaps/` and `.sdd/gaps/archive/`; `hub/server/index.ts` — add route handler for `GET /workspaces/:id/gaps`

**Acceptance criteria:**
- `parseGaps` reads all `GAP-*.md` files from both `.sdd/gaps/` and `.sdd/gaps/archive/` and returns structured objects with: `id`, `specItem`, `domain`, `status`, `discovered`, `auditVersion`, `closedBy`, `deferredReason`, `title`, `location`, `reasoning`
- Route handler returns 404 for unknown workspace id, 200 with JSON array otherwise
- Response Content-Type is `application/json`
- Unit test: `parseGaps` correctly parses a gap file's frontmatter and body fields
- Unit test: `parseGaps` returns results from both active and archive directories

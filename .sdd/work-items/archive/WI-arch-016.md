---
id: WI-arch-016
gap-id: GAP-arch-019
domain: architecture
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Implement GET /workspaces/:id/work-items endpoint

**Scope:** `hub/server/sdd-parser.ts` — add `parseWorkItems` function that reads `.sdd/work-items/` and `.sdd/work-items/archive/`; `hub/server/index.ts` — add route handler for `GET /workspaces/:id/work-items`

**Acceptance criteria:**
- `parseWorkItems` reads all `WI-*.md` files from both `.sdd/work-items/` and `.sdd/work-items/archive/` and returns structured objects with: `id`, `gapId`, `domain`, `status`, `created`, `abandonedReason`, `title`, `scope`, `acceptance`, `progressNote`, `blockedReason`, `closed`
- Route handler returns 404 for unknown workspace id, 200 with JSON array otherwise
- Response Content-Type is `application/json`
- Unit test: `parseWorkItems` correctly parses a work item file's frontmatter and body fields including acceptance criteria bullets
- Unit test: `parseWorkItems` returns results from both active and archive directories

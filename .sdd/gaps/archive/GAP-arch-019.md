---
id: GAP-arch-019
spec-item: SPEC-arch-016
domain: architecture
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: "b44a9deb"
closed-by: WI-arch-016
deferred-reason: null
---

# Gap: GET /workspaces/:id/work-items endpoint not implemented

**Location:** hub/server/index.ts — no route handler for GET /workspaces/:id/work-items

**Reasoning:** The handleApi function has no regex match or route handler for the /workspaces/:id/work-items path; no parseWorkItems function exists in sdd-parser.ts either.

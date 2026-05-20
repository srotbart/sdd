---
id: GAP-arch-018
spec-item: SPEC-arch-015
domain: architecture
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: "b44a9deb"
closed-by: WI-arch-015
deferred-reason: null
---

# Gap: GET /workspaces/:id/gaps endpoint not implemented

**Location:** hub/server/index.ts — no route handler for GET /workspaces/:id/gaps

**Reasoning:** The handleApi function has no regex match or route handler for the /workspaces/:id/gaps path; no parseGaps function exists in sdd-parser.ts either.

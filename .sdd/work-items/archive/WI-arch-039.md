---
id: WI-arch-039
gap-id: GAP-arch-042
domain: architecture
status: done
created: "2026-06-27T23:01:57Z"
abandoned-reason: null
---

# Work Item: Sanitize the projection-read and design-read endpoint path segments

**Scope:** `hub/server/index.ts` (projection-read route ~:299 and design-read route ~:429) — route the `:name` URL segment through the existing `sanitizeProjectionName` before building the file path, returning a 400 on traversal attempts, matching what the comments routes already do.

**Acceptance criteria:**
- The projection-read route passes its name segment through `sanitizeProjectionName` and returns 400 when it is rejected (`/`, `\`, or `..`), before any `path.join`/filesystem access
- The design-read route does the same for its name segment
- Valid names continue to resolve and return the file content unchanged
- Test: a projection-read request with a `..`/backslash name is rejected (400) and does not read outside the projections directory
- Test: a design-read request with a traversal name is rejected (400)
- Test: a valid projection/design name still returns its content

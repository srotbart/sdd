---
id: GAP-arch-042
spec-item: SPEC-arch-042
domain: architecture
status: closed
discovered: "2026-06-27T22:46:57Z"
audit-spec-version: "b4fb72b1"
closed-by: WI-arch-039
deferred-reason: null
---

# Gap: Projection and design read endpoints skip path-traversal sanitization

**Locations:**
- `hub/server/index.ts:299`
- `hub/server/index.ts:429`

**Reasoning:** The projection-read and design-read routes build the file path from the unsanitized route segment (the regex `([^/?]+)` permits `..` and backslashes) instead of calling `sanitizeProjectionName` like the comments routes, so on Windows a `..\` path escapes the intended directory — diverging from SPEC-arch-042's safe projection file IO.

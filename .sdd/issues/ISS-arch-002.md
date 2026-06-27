---
id: ISS-arch-002
domain: architecture
status: open
location: "hub/server/index.ts:299"
severity: medium
discovered: "2026-06-27T21:55:29Z"
reviewed-by: null
---

# Issue: Projection and design read endpoints skip path-traversal sanitization

**Location:** `hub/server/index.ts:299` (and the design-read route at `index.ts:429`)
**Problem:** `GET /projections/:name` and `GET /designs/:name` build the file path directly from the unsanitized route segment — unlike the comments routes, which call `sanitizeProjectionName` — and the route regex `([^/?]+)` permits `..` and backslashes.
**Rationale:** On Windows (the hub's platform) `path.join` treats backslashes as separators, so a request like `/projections/..\..\..\secret` resolves outside the projections directory, allowing disclosure of arbitrary `.md` files on disk.
**Severity:** medium

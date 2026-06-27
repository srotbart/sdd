---
id: ISS-arch-002
domain: architecture
status: accepted
location: "hub/server/index.ts:299"
severity: medium
discovered: "2026-06-27T21:55:29Z"
reviewed-by: GAP-arch-042
engaged-by: GAP-arch-042
---

# Issue: Projection and design read endpoints skip path-traversal sanitization

**Location:** `hub/server/index.ts:299` (and the design-read route at `index.ts:429`)
**Problem:** `GET /projections/:name` and `GET /designs/:name` build the file path directly from the unsanitized route segment — unlike the comments routes, which call `sanitizeProjectionName` — and the route regex `([^/?]+)` permits `..` and backslashes.
**Rationale:** On Windows (the hub's platform) `path.join` treats backslashes as separators, so a request like `/projections/..\..\..\secret` resolves outside the projections directory, allowing disclosure of arbitrary `.md` files on disk.
**Severity:** medium

## Dialog

### 2026-06-27 — Agent
Recommendation: **accept as a gap** against SPEC-arch-042 (Hub server reads, writes, and
deletes co-located projection comments JSON — i.e. safe projection file IO). The read
endpoints diverge from the sanitisation the sibling comments routes already apply; this is a
divergence to fix, not a behaviour change, so a gap (not a spec change) is the right routing.
The user pre-authorised fixing this in the Tier-1 batch (PR 1), which serves as the accept
sign-off. Outcome: GAP-arch-042 written; issue archived as accepted.

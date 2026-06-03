---
id: GAP-arch-028
spec-item: SPEC-arch-033
domain: architecture
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "6165d585"
closed-by: WI-arch-026
deferred-reason: null
---

# Gap: POST /workspaces uses INSERT OR IGNORE, silently swallows duplicate path instead of returning 409

**Location:** `hub/server/index.ts:188-201`

**Reasoning:** `insertWorkspace` uses `INSERT OR IGNORE` so a duplicate path silently succeeds (returns empty-row workspace); SPEC-arch-033 requires catching the UNIQUE constraint violation and returning HTTP 409 with `{ error: "workspace with this path already exists" }`.

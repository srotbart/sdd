---
id: ISS-arch-005
domain: architecture
status: open
location: "hub/server/index.ts:178"
severity: medium
discovered: "2026-06-27T21:55:29Z"
reviewed-by: null
---

# Issue: handleApi god-function repeats 404 boilerplate across routes

**Location:** `hub/server/index.ts:178`
**Problem:** `handleApi` is a ~390-line linear if-chain where roughly nine routes repeat the identical `getWorkspaceById` + `if (!ws) json(404)` block, and the PUT-comments branch re-implements the existing `readBody` helper inline.
**Rationale:** A single oversized dispatcher with copy-pasted guard clauses is hard to scan, easy to make inconsistent, and error-prone to extend.
**Severity:** medium

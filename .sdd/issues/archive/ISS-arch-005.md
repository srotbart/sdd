---
id: ISS-arch-005
domain: architecture
status: accepted
location: "hub/server/index.ts:178"
severity: medium
discovered: "2026-06-27T21:55:29Z"
reviewed-by: fix/server-dedup
---

# Issue: handleApi god-function repeats 404 boilerplate across routes

**Location:** `hub/server/index.ts:178`
**Problem:** `handleApi` is a ~390-line linear if-chain where roughly nine routes repeat the identical `getWorkspaceById` + `if (!ws) json(404)` block, and the PUT-comments branch re-implements the existing `readBody` helper inline.
**Rationale:** A single oversized dispatcher with copy-pasted guard clauses is hard to scan, easy to make inconsistent, and error-prone to extend.
**Severity:** medium

## Dialog

### 2026-06-28 — Agent
Accepted as a **standards-violation refactor** (no gap, per SPEC-wf-028/029). Standards rule:
"thin route handlers — no god-functions; extract per-route handlers and shared guards"
(Architectural Rules). Refactored in `fix/server-dedup`: the 14 repeated
`getWorkspaceById` + 404 guards replaced by a single `requireWorkspace` helper. Behavior
preserved (server suite 337). Archived as accepted.

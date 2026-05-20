---
id: GAP-arch-012
spec-item: SPEC-arch-012
domain: architecture
status: closed
discovered: "2026-05-15T00:00:00Z"
audit-spec-version: "85924307"
closed-by: WI-arch-009
deferred-reason: null
---

# Gap: GET /browse-folder endpoint does not exist

**Location:** server/index.ts — no handler for GET /browse-folder; browse… button in dialog is a no-op

**Reasoning:** The endpoint has not been implemented; clicking browse… in the dialog does nothing.

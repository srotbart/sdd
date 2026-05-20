---
id: GAP-arch-016
spec-item: SPEC-arch-014
domain: architecture
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: "f7296545"
closed-by: WI-arch-013
deferred-reason: null
---

# Gap: GET /workspaces/:id/targets endpoint is not implemented

**Location:** hub/server/index.ts — no handler present

**Reasoning:** `handleApi` contains no route matching `/workspaces/:id/targets`; no target parser exists in sdd-parser.ts or elsewhere.

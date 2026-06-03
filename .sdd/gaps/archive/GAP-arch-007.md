---
id: GAP-arch-007
spec-item: SPEC-arch-024
domain: architecture
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "651d284b"
closed-by: WI-arch-022
deferred-reason: null
---

# Gap: GET /workspaces/:id/specs response does not include testStatus on SpecItems

**Location:** `hub/server/sdd-parser.ts:94`

**Reasoning:** The `SpecItem` interface and `parseSpecFile` return value have no `testStatus` field; the `/workspaces/:id/specs` endpoint returns items without the non-optional `testStatus` shape required by SPEC-arch-024.

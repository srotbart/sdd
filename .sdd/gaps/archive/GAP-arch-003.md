---
id: GAP-arch-003
spec-item: SPEC-arch-020
domain: architecture
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "651d284b"
closed-by: WI-arch-020
deferred-reason: null
---

# Gap: Vitest JSON report parser not implemented

**Location:** `hub/server/sdd-parser.ts:384`

**Reasoning:** No code in the server reads a Vitest JSON report file, walks `testResults[*].assertionResults`, or extracts `fullName`/`status`/`startTime` as required by SPEC-arch-020.

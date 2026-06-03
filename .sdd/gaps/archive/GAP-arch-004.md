---
id: GAP-arch-004
spec-item: SPEC-arch-021
domain: architecture
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "651d284b"
closed-by: WI-arch-020
deferred-reason: null
---

# Gap: Maven Surefire XML report parser not implemented

**Location:** `hub/server/sdd-parser.ts:384`

**Reasoning:** No code in the server reads `TEST-*.xml` files, parses `<testcase>` elements, or extracts `classname`/`name`/`timestamp` from Surefire XML as required by SPEC-arch-021.

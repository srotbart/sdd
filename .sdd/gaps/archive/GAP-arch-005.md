---
id: GAP-arch-005
spec-item: SPEC-arch-022
domain: architecture
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "651d284b"
closed-by: WI-arch-020
deferred-reason: null
---

# Gap: Test status computation (passing/failing/missing/not-run) not implemented

**Location:** `hub/server/sdd-parser.ts:384`

**Reasoning:** `parseSpecs` does not compute `testStatus` for any spec item; the four-state logic (not-run, missing, failing, passing) with `lastRun` timestamp required by SPEC-arch-022 is entirely absent.

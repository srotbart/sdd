---
id: GAP-arch-002
spec-item: SPEC-arch-019
domain: architecture
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "651d284b"
closed-by: WI-arch-020
deferred-reason: null
---

# Gap: Per-spec test mapping file (.tests.json) not implemented

**Location:** `hub/server/sdd-parser.ts:384`

**Reasoning:** `parseSpecs` does not read or process any `SPEC-{abbrev}.tests.json` companion file; there is no code anywhere in the server that handles the runner/report/items mapping schema required by SPEC-arch-019.

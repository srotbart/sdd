---
id: GAP-scr-044
spec-item: SPEC-scr-046
domain: ui-screens
status: closed
discovered: "2026-06-03T00:00:00Z"
audit-spec-version: "7e67e9da"
closed-by: WI-scr-047
deferred-reason: null
---

# Gap: Specs screen has no per-domain coverage summary strip

**Location:** `hub/client/src/screens/Specs.tsx:60`

**Reasoning:** SPEC-scr-046 requires a summary strip on the Specs screen showing covered/total fraction and passing/failing/missing/not-run counts per domain, but Specs.tsx only renders a title bar with total domain and item counts — no per-domain coverage summary exists.

---
id: GAP-arch-043
spec-item: SPEC-arch-014
domain: architecture
status: closed
discovered: "2026-06-27T23:14:08Z"
audit-spec-version: "0dadc41a"
closed-by: WI-arch-040
deferred-reason: null
---

# Gap: parseTargetFile truncates the Current statement to its first line

**Location:** `hub/server/sdd-parser.ts:143`
**Reasoning:** The statement regex `/^## Current statement\s*\n([\s\S]*?)(?=\n## |\s*$)/m` stops the lazy capture at the first end-of-line (the `\s*$` lookahead under `/m`), so multi-paragraph statements are returned with only their first line — the targets endpoint (SPEC-arch-014) does not serve the full parsed statement.

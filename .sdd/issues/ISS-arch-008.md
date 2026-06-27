---
id: ISS-arch-008
domain: architecture
status: open
location: "hub/server/sdd-parser.ts:143"
severity: high
discovered: "2026-06-27T22:18:12Z"
reviewed-by: null
---

# Issue: Target Current statement is truncated to its first line

**Location:** `hub/server/sdd-parser.ts:143`
**Problem:** `parseTargetFile` extracts the statement with `/^## Current statement\s*\n([\s\S]*?)(?=\n## |\s*$)/m` — the lazy `[\s\S]*?` plus the `\s*$` lookahead alternative under the `/m` flag matches end-of-line, so the capture stops at the first line break and only the first line of the statement is returned.
**Rationale:** Targets with multi-paragraph statements (tables, numbered lists, "open decisions") render almost empty in the UI — e.g. TGT-101 shows only "…should have \*\*user-authored", cut off mid-sentence (which also leaves an unclosed `**` span, so Markdown shows the raw asterisks); the rest of the statement is silently dropped. The fix is to capture up to the next `## ` heading or EOF (e.g. split on `\n(?=## )` like the spec parser, or drop the `\s*$` alternative / `/m` flag).
**Severity:** high

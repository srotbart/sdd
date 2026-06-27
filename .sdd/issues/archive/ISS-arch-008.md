---
id: ISS-arch-008
domain: architecture
status: accepted
location: "hub/server/sdd-parser.ts:143"
severity: high
discovered: "2026-06-27T22:18:12Z"
reviewed-by: GAP-arch-043
engaged-by: GAP-arch-043
---

# Issue: Target Current statement is truncated to its first line

**Location:** `hub/server/sdd-parser.ts:143`
**Problem:** `parseTargetFile` extracts the statement with `/^## Current statement\s*\n([\s\S]*?)(?=\n## |\s*$)/m` — the lazy `[\s\S]*?` plus the `\s*$` lookahead alternative under the `/m` flag matches end-of-line, so the capture stops at the first line break and only the first line of the statement is returned.
**Rationale:** Targets with multi-paragraph statements (tables, numbered lists, "open decisions") render almost empty in the UI — e.g. TGT-101 shows only "…should have \*\*user-authored", cut off mid-sentence (which also leaves an unclosed `**` span, so Markdown shows the raw asterisks); the rest of the statement is silently dropped. The fix is to capture up to the next `## ` heading or EOF (e.g. split on `\n(?=## )` like the spec parser, or drop the `\s*$` alternative / `/m` flag).
**Severity:** high

## Dialog

### 2026-06-27 — Agent
Recommendation: **accept as a gap** against SPEC-arch-014 (GET /workspaces/:id/targets
returns parsed target files as JSON). The truncation is a code divergence in
`parseTargetFile` — the parser fails to return the full statement the endpoint is meant to
serve — not a behaviour change, so a gap (not a spec change) is correct. User pre-authorised
fixing this in the prioritised batch (PR 2), which is the accept sign-off. Outcome:
GAP-arch-043 written; issue archived as accepted.

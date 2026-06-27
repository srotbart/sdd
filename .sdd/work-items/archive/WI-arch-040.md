---
id: WI-arch-040
gap-id: GAP-arch-043
domain: architecture
status: done
created: "2026-06-27T23:14:08Z"
abandoned-reason: null
---

# Work Item: Capture the full Current statement in parseTargetFile

**Scope:** `hub/server/sdd-parser.ts:143` — replace the statement-extraction regex so it captures everything from the `## Current statement` heading up to the next `## ` heading (or end of file), instead of stopping at the first line break.

**Acceptance criteria:**
- A multi-paragraph Current statement (paragraphs, lists, tables) is returned in full, not truncated to its first line
- The capture stops at the next `## ` heading (e.g. `## Dialog`) and does not absorb the dialog
- A single-line statement still parses unchanged
- CRLF and LF line endings both parse correctly
- Test: parseTargets on a target with a multi-paragraph statement returns the full text (asserts a phrase from the last paragraph is present and the dialog text is absent)

---
id: GAP-wf-004
spec-item: SPEC-wf-012
domain: workflow
status: closed
discovered: "2026-05-28T00:00:00Z"
audit-spec-version: "74ee0b97"
closed-by: WI-wf-004
deferred-reason: null
---

# Gap: install-statusline spec-count fallback globs flat SPEC-*.md files that no longer exist

**Location:** `plugin/skills/install-statusline/SKILL.md:78`

**Reasoning:** The fallback command `ls .sdd/specs/SPEC-*.md` targets flat domain-level files; under the per-subdirectory structure mandated by SPEC-wf-013 no such files exist, so the count always returns zero.

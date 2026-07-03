---
id: GAP-wf-b861c4b
spec-item: SPEC-wf-037
domain: workflow
status: closed
discovered: "2026-07-03T02:29:42Z"
audit-spec-version: "fe5b4d86"
closed-by: WI-wf-dc57a5a
deferred-reason: null
---

# Gap: Ephemeral-minting skills compute sequential {seq} via archive scan instead of minting {7hex} hash IDs

**Locations:**
- `plugin/skills/spec-audit/SKILL.md:96-98` — GAP IDs use "next available sequence number", max across active + `archive/`
- `plugin/skills/gap-to-work-items/SKILL.md:55-58` — WI IDs use "next available sequence number", max across active + `archive/`
- `plugin/skills/review-issues/SKILL.md:55-56` — ISS IDs use "next available sequence number for the domain"
- `plugin/skills/review-improvements/SKILL.md:56-57` — IMP IDs use "next available sequence number for the domain"

**Reasoning:** All four ephemeral-artifact minting flows derive a sequential `{seq}` by scanning active and `archive/` directories, which depends on archive contents (now local-only per SPEC-wf-035) and needs coordination in parallel worktrees; SPEC-wf-037 requires minting `{PREFIX}-{abbrev}-{7hex}` with no lookup.

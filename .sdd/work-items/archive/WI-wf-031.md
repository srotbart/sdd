---
id: WI-wf-031
gap-id: GAP-wf-032
domain: workflow
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Create projection-comments skill (SPEC-wf-034)

**Scope:** `plugin/skills/projection-comments/SKILL.md` — create a new SDD skill that reads `<name>.comments.json` (SPEC-arch-042), applies the action semantics to the projection markdown `<name>.md`, removes successfully addressed entries, leaves unaddressable entries in place, and keeps the pruned JSON consistent with what the Projections UI reads. Add tests in `hub/server/spec-wf-plugin.test.ts`.

**Acceptance criteria:**
- A skill exists at `plugin/skills/projection-comments/SKILL.md`
- The skill description mentions addressing projection comments and pruning the handled ones
- The skill reads `<name>.comments.json` entries for a named projection
- For each entry it applies clarify/re-evaluate/expand/condense to `<name>.md`, guided by `selectedText`/`line`/`note`
- After successfully addressing an entry, the skill removes that entry from the comments JSON
- Entries that cannot be addressed confidently are left in place
- The resulting pruned JSON is consistent with what the Projections UI reads (same format as SPEC-arch-042)
- The skill operates per projection (named or via selection) and does not touch unrelated artifacts
- Tests in `hub/server/spec-wf-plugin.test.ts` verify: skill file exists, mentions actions, mentions reading/writing comments JSON, mentions not silently dropping unaddressable entries

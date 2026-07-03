---
id: SPEC-wf-034
domain: workflow
abbrev: wf
status: active
aliases: []
version: "1c865cd3"
---

# SPEC-wf-034 — A skill addresses projection comments and prunes the ones it handles

## Invariant

A dedicated SDD skill reads a projection's co-located `<name>.comments.json` (SPEC-arch-042) and,
for each comment entry, performs the requested action on the projection markdown
(`.sdd/projections/<name>.md`): **clarify** adds a clarification, **re-evaluate** reassesses and
rewrites the relevant text, **expand** elaborates it, **condense** shortens it — using the
entry's `selectedText`, `line`, and `note` to locate and guide the edit. After addressing an
entry, the skill removes that entry from the comments JSON so it no longer renders in the
Projections UI (SPEC-scr-053). Entries the skill cannot confidently address are left in place
rather than silently dropped, and the pruned JSON stays consistent with what the UI reads.

## Acceptance criteria

- A skill exists that, given a projection, reads its `<name>.comments.json` entries
- For each entry it applies the action semantics — clarify / re-evaluate / expand / condense —
  to the relevant text or section of `<name>.md`, guided by `selectedText` / `line` / `note`
- After successfully addressing an entry, the skill removes that entry from the comments JSON
- Entries that cannot be addressed are left in place (not silently dropped)
- The resulting pruned JSON is consistent with the format the Projections UI reads, so addressed
  comments stop rendering
- The skill operates per projection (named or selected) and does not touch unrelated artifacts

**Tests:**
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-034: projection-comments skill addresses comments and prunes handled entries > SPEC-wf-034: skill file exists at plugin/skills/projection-comments/SKILL.md` — the projection-comments skill is a committed plugin artifact
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-034: projection-comments skill addresses comments and prunes handled entries > SPEC-wf-034: description mentions addressing projection comments and pruning` — the skill's purpose is addressing and pruning projection comments
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-034: projection-comments skill addresses comments and prunes handled entries > SPEC-wf-034: skill reads .comments.json for the named projection` — the skill reads the projection's co-located comments file
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-034: projection-comments skill addresses comments and prunes handled entries > SPEC-wf-034: skill lists all four action types: clarify, re-evaluate, expand, condense` — the skill handles every comment action type
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-034: projection-comments skill addresses comments and prunes handled entries > SPEC-wf-034: skill states that unaddressable entries are left in place (not silently dropped)` — comments the skill cannot address are preserved rather than dropped
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-034: projection-comments skill addresses comments and prunes handled entries > SPEC-wf-034: skill instructs writing the pruned JSON back to .comments.json` — the skill persists the pruned comments back to disk
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-034: projection-comments skill addresses comments and prunes handled entries > SPEC-wf-034: skill ends with a next-step footer referencing session-start` — the skill output ends with a session-start next-step footer
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-034: projection-comments skill addresses comments and prunes handled entries > SPEC-wf-034: skill states it operates per projection and does not touch unrelated artifacts` — the skill's scope is limited to the named projection

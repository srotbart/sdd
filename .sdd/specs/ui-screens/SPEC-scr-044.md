---
id: SPEC-scr-044
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "1b9cdc03"
---

# SPEC-scr-044 — Plugin reference page derives skill list from installed plugin SKILL.md files

## Invariant

The plugin reference page's Skills section is populated dynamically from the installed SDD plugin rather than from a hardcoded array. The Hub backend exposes `GET /plugin-skills` which reads `~/.claude/plugins/cache/sdd/sdd/*/skills/*/SKILL.md` files (using the most recently installed version), extracts the `name` and `description` fields from each file's YAML frontmatter, and returns them sorted by name. The frontend fetches this endpoint on mount and renders the list; the hardcoded `SKILLS` constant is removed.

## Acceptance criteria

- `GET /plugin-skills` returns an array of `{ name, description }` objects, one per skill directory containing a `SKILL.md`
- The backend globs `~/.claude/plugins/cache/sdd/sdd/*/skills/` and uses the highest semver version directory found
- Each skill entry is derived from the `name` and `description` frontmatter fields of `SKILL.md`
- Skills are returned sorted by `name` ascending
- `PluginReference.tsx` fetches `/plugin-skills` on mount and replaces the hardcoded `SKILLS` array with the fetched data
- If the endpoint fails or returns empty, the skills section shows a fallback message rather than an empty list
- The endpoint is not workspace-scoped — it reflects the globally installed plugin

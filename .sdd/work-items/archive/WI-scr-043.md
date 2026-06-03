---
id: WI-scr-043
gap-id: GAP-scr-042
spec-item: SPEC-scr-044
status: done
created: "2026-06-02T00:00:00Z"
abandoned-reason: null
---

**Scope:** `hub/server/index.ts` — add `GET /plugin-skills` route to `handleApi` that globs `~/.claude/plugins/cache/sdd/sdd/*/skills/*/SKILL.md`, picks the highest semver version directory, extracts `name` and `description` from each file's YAML frontmatter, and returns them sorted by name

**Acceptance criteria:**
- `GET /plugin-skills` returns a JSON array of `{ name, description }` objects derived from installed SKILL.md frontmatter
- The backend selects the highest semver version under `~/.claude/plugins/cache/sdd/sdd/*/`
- Skills are sorted by `name` ascending
- Endpoint is not workspace-scoped (no workspace ID required)
- Returns empty array gracefully when the plugin cache directory does not exist
- Test: `hub/server/` has a test covering the endpoint response shape and sort order

---
id: WI-wf-010
gap-id: GAP-wf-008
domain: workflow
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Create install-statusline skill file at plugin/skills/install-statusline/SKILL.md

**Scope:** `plugin/skills/install-statusline/SKILL.md` — create the skill directory and SKILL.md with: frontmatter (name, description, version), procedure that reads `.claude/settings.json` in `$PWD` (creates if absent), merges the `statusline` key with the SDD statusline configuration, writes back only to local scope, and prints the completion message

**Acceptance criteria:**
- `plugin/skills/install-statusline/SKILL.md` exists with valid frontmatter
- Procedure reads and merges `.claude/settings.json` in the current working directory (not `~/.claude/settings.json`)
- Completion message is exactly: `Statusline installed to .claude/settings.json (local scope). Restart Claude Code to apply.`
- Verification: skill file exists and contains the completion message string

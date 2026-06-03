---
id: SPEC-wf-009
domain: workflow
abbrev: wf
status: active
aliases: []
version: "2654c7a4"
---

# SPEC-wf-009 — /sdd:install-statusline skill appends SDD delegation to the user's global statusline script

## Invariant

A skill `/sdd:install-statusline` exists in the SDD plugin at `plugin/skills/install-statusline/SKILL.md`. When invoked, it reads `~/.claude/settings.json` to find the `statusLine.command` script path, then appends a minimal SDD delegation block to that script. The block checks for a `.sdd/` directory (walking up parent directories) and, if found, delegates to `statusline.sh` shipped with the plugin. The operation is idempotent: if the script already contains a reference to `plugins/cache/sdd`, it prints a message and exits without modifying the file. The skill never writes to any `settings.json` file.

## Acceptance criteria

- `plugin/skills/install-statusline/SKILL.md` exists in the SDD plugin
- Skill reads `~/.claude/settings.json` and extracts the `statusLine.command` script path
- If no `statusLine.command` is configured, skill prints an error and stops
- Skill appends the SDD delegation block (3 lines) to the end of the found script file
- Idempotency: if `plugins/cache/sdd` is already present in the script, skill skips and reports "already installed"
- Skill never modifies any `settings.json` file
- `plugin/statusline.sh` exists alongside the plugin skills and contains the SDD status line output logic

---
id: SPEC-wf-010
domain: workflow
abbrev: wf
status: active
aliases: []
version: "8ca51406"
---

# SPEC-wf-010 — Global statusline script renders shell context as the first line

## Invariant

The global statusline script (`~/.claude/statusline-command.sh`) renders a first line showing: `➜  {dir} │ git:({branch}) ✗ │ [████░░░░░░] {pct}%`. The directory is the basename of the current working directory. Git info is omitted when not in a git repo. The context bar is 10 characters wide using `█` for used and `░` for unused. The dirty marker (`✗`) appears only when the working tree has uncommitted changes. All output uses ANSI escape codes, not hex color values.

## Acceptance criteria

- First output line shows `➜` (green), basename of cwd (cyan), git branch info when in a git repo, and context bar with percentage (grey)
- Git section is omitted entirely when not in a git repository
- `✗` (yellow) appears after the branch when working tree is dirty; absent when clean
- Context bar is always 10 chars: filled blocks for used percentage, empty blocks for remainder
- Colors are ANSI escape codes (e.g. `\033[1;32m`), not JSON hex color values
- Script reads workspace context from stdin as JSON (`workspace.current_dir`, `context_window.used_percentage`)

**Tests:** skipped — rendered by the user's global statusline script, a user-machine file, not in-repo code

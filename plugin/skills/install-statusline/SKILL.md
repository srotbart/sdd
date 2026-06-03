---
name: install-statusline
description: This skill should be used when the user invokes `/sdd:install-statusline` or asks to "install the SDD statusline", "set up the statusline", or "add SDD statusline to Claude Code". Appends a minimal SDD delegation block to the user's global statusline script so that an SDD line appears when inside a repo with a .sdd/ directory.
version: 0.1.1
---

# SDD Install Statusline

Append a minimal SDD delegation block to the user's global statusline script. The block checks for a `.sdd/` directory in the current working directory and, if found, delegates to `statusline.sh` shipped with this plugin.

## Procedure

### 1. Find the global statusline script

Read `~/.claude/settings.json` and extract the `statusLine.command` value:

```bash
cat ~/.claude/settings.json | jq -r '.statusLine.command // empty'
```

If no `statusLine.command` is set, print:

```
No global statusLine command found in ~/.claude/settings.json.
Configure a statusLine command first, then re-run /sdd:install-statusline.
```

…and stop.

Extract the script path from the command (the last space-separated token, typically a `.sh` file path):

```bash
# e.g. "bash /Users/you/.claude/statusline-command.sh" → "/Users/you/.claude/statusline-command.sh"
script_path=$(cat ~/.claude/settings.json | jq -r '.statusLine.command' | awk '{print $NF}')
```

### 2. Check idempotency

Search the script for an existing SDD delegation block:

```bash
grep -q "plugins/cache/sdd" "$script_path"
```

If found, print:

```
SDD statusline already installed in <script_path>. Nothing to do.
```

…and stop.

### 3. Append the delegation block

Append the following block verbatim to the end of the script file. Do not modify any existing content.

```bash

# SDD: delegate to plugin statusline when inside a .sdd repo
if [ -d "$cwd/.sdd" ]; then
    sdd_script=$(ls "$HOME/.claude/plugins/cache/sdd/sdd/"*/statusline.sh 2>/dev/null | head -1)
    [ -n "$sdd_script" ] && printf "\n" && echo "$input" | bash "$sdd_script"
fi
```

The block uses `$cwd` and `$input` which are expected to be already defined in the global script (the standard pattern for any Claude Code statusline script that reads stdin JSON).

### 4. Confirm

Print:

```
SDD statusline installed in <script_path>.
Restart Claude Code to apply.
```

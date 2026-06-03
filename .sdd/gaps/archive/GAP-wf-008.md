---
id: GAP-wf-008
spec-item: SPEC-wf-009
domain: workflow
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "b56c0b34"
closed-by: WI-wf-010
deferred-reason: null
---

# Gap: /sdd:install-statusline skill does not exist in the plugin

**Location:** `plugin/skills/`

**Reasoning:** No `install-statusline/` directory exists under `plugin/skills/`; SPEC-wf-009 requires a skill at `plugin/skills/install-statusline/SKILL.md` that reads `.claude/settings.json`, merges the `statusline` key, and writes back to local scope only.

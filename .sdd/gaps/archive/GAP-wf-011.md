---
id: GAP-wf-011
spec-item: SPEC-wf-012
domain: workflow
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "b56c0b34"
closed-by: WI-wf-011
deferred-reason: null
---

# Gap: Statusline SDD count fetching (Hub API + .sdd/ fallback) not implemented — install-statusline skill absent

**Location:** `plugin/skills/`

**Reasoning:** No `install-statusline` skill exists in the plugin; the count-fetching logic that calls Hub API endpoints and falls back to `.sdd/` file counting (SPEC-wf-012) has no code path to implement it.

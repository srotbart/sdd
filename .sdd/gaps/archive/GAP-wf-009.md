---
id: GAP-wf-009
spec-item: SPEC-wf-010
domain: workflow
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "b56c0b34"
closed-by: WI-wf-011
deferred-reason: null
---

# Gap: Statusline left segment (shell context) not implemented — install-statusline skill absent

**Location:** `plugin/skills/`

**Reasoning:** No `install-statusline` skill exists in the plugin; the left segment rendering `→ {dir} | git:({branch}) {dirty} | [{context-bar}] {context-pct}%` with the specified hex colors (SPEC-wf-010) has no code path to implement it.

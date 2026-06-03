---
id: GAP-wf-010
spec-item: SPEC-wf-011
domain: workflow
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "b56c0b34"
closed-by: WI-wf-011
deferred-reason: null
---

# Gap: Statusline right segment (SDD pipeline state) not implemented — install-statusline skill absent

**Location:** `plugin/skills/`

**Reasoning:** No `install-statusline` skill exists in the plugin; the right segment rendering `specs: {n} | targets: {awaiting} | gaps: {open} | work: {pending}/{in-progress}` with conditional coloring (SPEC-wf-011) has no code path to implement it.

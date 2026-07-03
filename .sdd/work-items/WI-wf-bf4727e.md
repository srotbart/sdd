---
id: WI-wf-bf4727e
gap-id: GAP-wf-159d5f0
domain: workflow
status: done
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Align session-start orientation chain with the close-domain loop

**Scope:** `plugin/skills/session-start/SKILL.md` (orientation "Pipeline model", ~line 97) — update the "Concrete skills" line so the execution trio (spec-audit → gap-to-work-items → work-item-close) is shown as wrapped/driven by `close-domain` (worker-v2). Keep the orientation ≤15 lines. Documentation only — the SPEC-wf-030 orientation tests (`contains "orientation"`, `contains "spec.*code.*review"`) must still pass.

**Acceptance criteria:**
- The orientation's concrete-skills line references `close-domain` as the loop wrapping the execution trio
- The orientation stays within its ≤15-line budget and keeps the pipeline mental model line
- Verify: the SPEC-wf-030 grep tests still hold (orientation + `spec.*code.*review` present)

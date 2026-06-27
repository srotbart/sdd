---
id: ISS-wf-003
domain: workflow
status: open
location: "plugin/skills/spawn-sdd-worker/SKILL.md"
severity: medium
discovered: "2026-06-27T23:04:26Z"
reviewed-by: null
---

# Issue: No autonomous driver for the audit→decompose→close loop

**Location:** `plugin/skills/spawn-sdd-worker/SKILL.md` (+ the per-skill `Next:` footers in gap-to-work-items / work-item-close)
**Problem:** Every execution skill ends with an interactive `Next: run /sdd:...` footer aimed at a human stepping through one skill at a time, and there is no single skill that internally loops decompose→close. The `sdd-worker` is meant to drive that loop, but a background teammate treats each skill's completion as end-of-turn and goes idle at the `Next:` boundary instead of chaining to the next skill.
**Rationale:** Observed live closing GAP-arch-041/042: the worker reliably ran one `gap-to-work-items` and stopped, requiring repeated manual nudges to advance to `work-item-close`; multi-step execution did not proceed autonomously. Either the worker prompt needs to force the full loop in one turn, or an explicit "close all work items for {domain}" looping skill is needed so the worker doesn't stall at each interactive footer.
**Severity:** medium

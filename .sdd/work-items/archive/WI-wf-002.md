---
id: WI-wf-002
gap-id: GAP-wf-002
domain: workflow
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Update session-start next-action table to reference sdd-worker

**Scope:** `plugin/skills/session-start/SKILL.md:79-81` — replace the three execution-phase rows (stale audits, open gaps, pending work items) with rows that suggest `/sdd:spawn-sdd-worker {domain}` as the entry point for all execution work.

**Acceptance criteria:**
- Lines referencing `/sdd:spec-audit`, `/sdd:gap-to-work-items`, and `/sdd:work-item-close` in the next-action table are replaced
- New rows suggest `/sdd:spawn-sdd-worker {domain}` when stale audits, open gaps, or pending work items exist
- The table retains existing rows for targets awaiting user, ready targets, uncovered spec items, and all-clear
- Verification: grep confirms `/sdd:spawn-sdd-worker` appears in the next-action table and the three individual pipeline skill suggestions are removed

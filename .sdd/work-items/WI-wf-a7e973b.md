---
id: WI-wf-a7e973b
gap-id: GAP-wf-9c48086
domain: workflow
status: done
created: "2026-07-03T02:31:16Z"
abandoned-reason: null
---

# Work Item: Add tracked-ephemeral-archive backstop to lint-check.sh

**Scope:** `plugin/scripts/lint-check.sh` — add a check that fails when any git-tracked file exists under an ignored ephemeral `archive/` path (`git ls-files` over the five paths must be empty).

**Acceptance criteria:**
- lint-check.sh fails (non-zero, `fail`-logged) when a file under an ignored ephemeral archive path is tracked (e.g. `git add -f`)
- lint-check.sh passes when no such tracked files exist
- The check covers all five ephemeral archive paths and does not flag `.sdd/specs/**/archive/`
- Test (hub `spec-wf-plugin.test.ts` or a shell test): force-add a file under an ignored archive dir → lint fails; clean tree → lint passes

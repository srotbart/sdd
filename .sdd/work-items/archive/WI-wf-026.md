---
id: WI-wf-026
gap-id: GAP-wf-027
domain: workflow
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Scaffold lint/CI gate for mechanically-checkable standards

**Scope:** `plugin/scripts/lint-check.sh` (new) — create a runnable lint/CI gate script that checks mechanically-checkable standards and can be wired as a pre-commit hook or CI step

**Acceptance criteria:**
- `plugin/scripts/lint-check.sh` exists and is executable
- Script reads `.sdd/standards/` rubric (or informs user if no standards defined yet)
- Script exits non-zero on violations it can mechanically detect
- Script includes instructions for wiring as a git pre-commit hook or CI step
- Script does not run `/sdd:spec-audit` (spec-audit is not a standards enforcement mechanism)
- Test: `bash plugin/scripts/lint-check.sh` exits 0 in a clean state
- Test: script output includes instructions for hook/CI integration

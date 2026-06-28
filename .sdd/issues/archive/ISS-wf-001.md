---
id: ISS-wf-001
domain: workflow
status: accepted
location: ".sdd/specs/workflow/SPEC-wf-025.md:25"
severity: medium
discovered: "2026-06-27T21:55:29Z"
reviewed-by: fix/spec-test-debt
---

# Issue: SPEC-wf-025/026 Tests blocks list prose assertions, not real tests

**Location:** `.sdd/specs/workflow/SPEC-wf-025.md:25-28` and `.sdd/specs/workflow/SPEC-wf-026.md:25-28`
**Problem:** Both specs' `**Tests:**` blocks describe behaviours ("review-issues uses the Agent tool to spawn 3 reviewers", directory-exists checks) but no vitest test or check-script anywhere references review-issues/review-improvements or `ISS-`/`IMP-` scaffolding, so the listed "tests" do not exist.
**Rationale:** Sibling skill-spawn specs (wf-005/020/021) are backed by real tests in `hub/server/spec-wf-plugin.test.ts`, so wf-025/026's core invariant (exactly 3 agents, no auto-fix) is entirely unverified despite presenting a Tests block.
**Severity:** medium

## Dialog

### 2026-06-28 — Agent
Accepted and fixed directly. SPEC-wf-025/026 carried descriptive Tests blocks naming tests
that did not exist. Wrote real vitest coverage in `hub/server/spec-wf-plugin.test.ts` (5 cases
each: 3-agents-via-Agent-tool, no-TeamCreate, artifact shape, never-auto-fix/apply, storage+
archive scaffolded), then repointed both specs' Tests blocks at the real cases and recomputed
their versions. Archived as accepted.

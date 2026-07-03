---
id: SPEC-wf-041
domain: workflow
abbrev: wf
status: active
aliases: []
version: "5a15136a"
---

# SPEC-wf-041 — Guardian cross-domain audit gates worker completion

## Invariant

After all work items are closed and tests pass, `sdd:close-domain` runs a guardian audit before reporting complete: it diffs all files changed since the run's recorded start point, maps each changed file to governing spec items across ALL domains (regenerated index + `scope:` globs + reasoning), and audits the changes against those items. Violations introduced by this run's own changes are fixed inline and the guardian audit re-runs — no gap artifacts are written for own fresh work. Escalation to the team lead (instead of reporting complete) happens when a fix requires judgment: two spec items in tension, a fix that would alter merged behavior outside the run's scope, or two fix→re-audit cycles without convergence. Pre-existing violations (not from this run's diff) are reported to the lead as candidate gaps and are never fixed inline; they do not block completion. The worker reports complete only on a clean guardian audit.

## Acceptance criteria

- `sdd:close-domain` records the run's git start point at Phase 0 and diffs changed files against it at Phase 4
- Changed files are mapped to spec items across all domains, not only the audited domain
- Own-run violations are fixed inline and re-audited; no gap artifacts are created for them
- Escalation triggers are stated: spec tension, out-of-scope fixes, or 2 fix-cycles without convergence
- Pre-existing violations are reported as candidate gaps, not fixed, and do not block completion
- "Complete" is reported to the lead only after a clean guardian audit

**Tests:**
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-041: guardian cross-domain audit gates worker completion > SPEC-wf-041: records the run's git start point at Phase 0 and diffs changed files at Phase 4` — the run's start point is recorded and diffed at the guardian audit
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-041: guardian cross-domain audit gates worker completion > SPEC-wf-041: maps changed files to spec items across all domains` — changed files are mapped to governing items across all domains
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-041: guardian cross-domain audit gates worker completion > SPEC-wf-041: own-run violations are fixed inline with no gap artifacts` — this run's own violations are fixed inline without creating gaps
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-041: guardian cross-domain audit gates worker completion > SPEC-wf-041: escalation triggers are stated (tension, out-of-scope, or 2 non-converging cycles)` — the escalation conditions are enumerated
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-041: guardian cross-domain audit gates worker completion > SPEC-wf-041: pre-existing violations are reported as candidate gaps, not fixed, not blocking` — pre-existing violations are reported rather than fixed
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-041: guardian cross-domain audit gates worker completion > SPEC-wf-041: complete is reported only on a clean guardian audit` — completion is gated on a clean guardian audit

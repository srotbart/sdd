---
id: WI-wf-e73d89c
gap-id:
  - GAP-wf-13dec58
  - GAP-wf-cec52f0
  - GAP-wf-754a907
domain: workflow
status: done
created: "2026-07-03T00:00:00Z"
abandoned-reason: null
---

# Work Item: Create the close-domain orchestration skill

Many-to-one: GAP-wf-13dec58 (SPEC-wf-038, all five phases), GAP-wf-cec52f0 (SPEC-wf-041, Phase 4 guardian audit), and GAP-wf-754a907 (SPEC-wf-008, close-domain footer + advisory-footer rule) are all properties of the single new `plugin/skills/close-domain/SKILL.md` artifact, so one change closes all three.

**Scope:** `plugin/skills/close-domain/SKILL.md` (new) — an SDD skill `/sdd:close-domain {domain}` that structurally drives the full loop. Phase 0 orient: run `plugin/scripts/spec-index.js` to build the full-corpus index and send a first-report handshake to the team lead (domain, active item count, phase plan); record the run's git start point. Phase 1 audit: run `sdd:spec-audit {domain}`, report gaps or "nothing to do" and stop. Phase 2 decompose: run `sdd:gap-to-work-items {domain}`, report/stop if none. Phase 3 close: for each open work item, select and load relevant cross-domain spec items (index + `scope:` globs; read-only spec-discovery subagent when inconclusive, reported fallback), run `sdd:work-item-close`, self-check. Phase 4 guardian audit: re-run spec-index, diff changed files vs the recorded start point, map to spec items across ALL domains, fix own-run violations inline and re-audit (no gap artifacts), escalate on judgment cases (spec tension / out-of-scope fix / 2 non-converging cycles), report pre-existing violations as candidate gaps without fixing. State that inner `Next:` footers are advisory. End with the SPEC-wf-008 footer (completion: "Run `/sdd:session-start` to review state"; escalation: the blocker description). Also update docs-sync surfaces so the new skill does not break SPEC-wf-031/033 drift checks. Register the skill so `Skill` can invoke it. Depends on WI-wf-b2e06e7 (spec-index).

**Acceptance criteria:**
- `plugin/skills/close-domain/SKILL.md` exists with frontmatter (`name: close-domain`, description) and contains all five phases in order (orient, audit, decompose, close, guardian audit)
- Phase 0 runs `spec-index.js`, sends the first-report handshake, and records the run's git start point
- Phase 4 diffs changed files vs the start point, maps across all domains, fixes own-run violations inline (no gap artifacts), states escalation triggers, reports pre-existing violations as candidate gaps, and reports complete only on a clean audit
- The skill states inner-skill `Next:` footers are advisory, and ends with the conditional close-domain footer (completion vs escalation)
- The skill's stop conditions are exactly: nothing to do, complete-and-clean, or escalation
- README "## Skills" table, `sdd-help` All Skills section, and `plugin.json` description are regenerated so `node plugin/scripts/check-skills-drift.js` exits 0 with close-domain present
- Test: a grep-style spec test (matching `hub/server/spec-wf-plugin.test.ts`) asserts close-domain/SKILL.md contains the five phase names, the fix-inline/escalate rule, and the advisory-footer statement
- Test: `node plugin/scripts/check-skills-drift.js` exits 0 after regeneration (drift check passes with close-domain listed)

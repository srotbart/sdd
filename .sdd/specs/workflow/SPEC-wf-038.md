---
id: SPEC-wf-038
domain: workflow
abbrev: wf
status: active
aliases: []
version: "388febed"
---

# SPEC-wf-038 — close-domain skill drives the full execution loop for a domain

## Invariant

A skill `/sdd:close-domain {domain}` exists in the SDD plugin and internally drives the entire execution pipeline — the loop is structural (encoded in the skill), never dependent on agent memory or prompt recall. Its phases, in order: **Phase 0 — orient**: build the full-corpus spec index by running the spec-index script (SPEC-wf-039) and send a first-report handshake to the team lead (domain, active item count, phase plan); **Phase 1 — audit**: run `sdd:spec-audit {domain}` and report every gap found (IDs and locations) to the lead — if none, report "nothing to do" and stop; **Phase 2 — decompose**: run `sdd:gap-to-work-items {domain}` — if no work items result, report and stop; **Phase 3 — close**: for each open work item in sequence, select and load relevant cross-domain spec items, run `sdd:work-item-close`, and self-check per SPEC-wf-040; **Phase 4 — guardian audit** per SPEC-wf-041. Inner skills' `Next:` footers are advisory inside close-domain. The only stop conditions are: nothing to do, all phases clean (report complete), or escalation to the lead. **Execution never modifies spec item files**: a gap whose fix requires editing a spec item is an escalation, not a close — the only permitted spec-file writes from execution are the mechanical annotations (`**Tests:**` linking and `scope:` backfill per SPEC-wf-042) plus their version-hash recomputation, which never touch invariant or acceptance-criteria content. **close-domain is the sdd-worker's operating loop**: its description and preamble state this and redirect a lead/main session to `/sdd:spawn-sdd-worker {domain}` instead of running the loop in-session.

## Acceptance criteria

- `plugin/skills/close-domain/SKILL.md` exists in the SDD plugin
- The skill's procedure contains all five phases in order (orient, audit, decompose, close, guardian audit)
- Phase 0 runs the spec-index script and sends a first-report handshake to the team lead
- The skill states that inner skills' `Next:` footers are advisory and never stop points
- The skill's stop conditions are exactly: nothing to do, complete-and-clean, or escalation
- The skill states that a fix requiring a spec item edit escalates to the lead (mechanical `**Tests:**`/`scope:` writes excepted)
- The skill's description and preamble identify it as the sdd-worker's operating loop and redirect lead/main sessions to `spawn-sdd-worker`

**Tests:**
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-038: close-domain skill drives the full execution loop for a domain > SPEC-wf-038: close-domain/SKILL.md exists in the plugin` — the close-domain skill is a committed plugin artifact
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-038: close-domain skill drives the full execution loop for a domain > SPEC-wf-038: the skill contains all five phases in order (orient, audit, decompose, close, guardian)` — the skill encodes the five phases in sequence
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-038: close-domain skill drives the full execution loop for a domain > SPEC-wf-038: Phase 0 runs the spec-index script and sends a first-report handshake` — Phase 0 builds the index and sends the startup handshake
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-038: close-domain skill drives the full execution loop for a domain > SPEC-wf-038: the skill states inner Next: footers are advisory` — inner pipeline-skill footers do not stop the loop
- `hub/server/spec-wf-plugin.test.ts > SPEC-wf-038: close-domain skill drives the full execution loop for a domain > SPEC-wf-038: stop conditions are exactly nothing-to-do, complete-and-clean, escalation` — the loop stops only on the three defined conditions

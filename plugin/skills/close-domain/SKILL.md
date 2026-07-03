---
name: close-domain
description: The sdd-worker's operating loop — drives the full execution pipeline for one domain (audit → decompose → close → guardian audit). If you are in a lead or main session, run `/sdd:spawn-sdd-worker {domain}` instead. This skill is reserved for the sdd-worker; the loop is structural here, not carried in any agent prompt.
version: 0.1.0
---

# SDD Close Domain

This skill is the `sdd-worker`'s operating loop. It drives the entire execution
pipeline for one domain, end to end, without stopping for interactive confirmation
between stages. The loop is structural: encoded here in the skill, never in agent
memory or a spawn prompt. An agent that forgets the steps re-reads this file; it
does not improvise them.

**If you are the lead or in a main session:** do not run this skill directly.
Invoke `/sdd:spawn-sdd-worker {domain}` instead — the worker will call close-domain
as its first action.

## Input

Accept a single domain name: `/sdd:close-domain authentication`.

If no domain is given, infer the highest-priority domain with open gaps or pending
work items from the current SDD state; if that is ambiguous, ask.

## The loop

Run the five phases below **in order**. Inner pipeline skills (`sdd:spec-audit`,
`sdd:gap-to-work-items`, `sdd:work-item-close`) each end with an interactive
`Next:` footer — **inside close-domain those footers are advisory only**. Do not
treat a footer as a stop point; proceed by this phase plan. The only stop
conditions are: **nothing to do**, **complete and clean**, or **escalation to the
team lead**.

### Phase 0 — Orient

1. Build the full-corpus spec index by running the index script — never assemble it
   by hand (determinism is the point):
   ```bash
   node plugin/scripts/spec-index.js
   ```
   This prints one line per active spec item across ALL domains
   (`{id}\t{domain}\t{title}\t{scope globs}`). Keep it in context — it is the map
   used to find cross-domain governing items in Phases 3 and 4.
2. **Record the run's git start point** — the commit the run begins from, used by
   the Phase 4 guardian audit to diff everything this run changed:
   ```bash
   git rev-parse HEAD
   ```
3. Send the **first-report handshake** to the team lead (via SendMessage): the
   domain, the active spec-item count from the index, and the phase plan. This
   handshake is the startup guarantee — it fires before any audit or edit.

### Phase 1 — Audit

Run `sdd:spec-audit {domain}`. Report every gap found (IDs and locations) to the
team lead. **If no gaps are found, report "nothing to do" and stop** — do not
proceed to Phase 2.

### Phase 2 — Decompose

Run `sdd:gap-to-work-items {domain}`. **If no work items result, report and
stop** — do not proceed to Phase 3.

### Phase 3 — Close, with cross-domain compliance

For each open work item in the domain, in sequence:

1. **Select the governing spec items.** From the work item's scope (files/areas),
   pick the relevant spec items across ALL domains using the Phase 0 index plus any
   `scope:` globs (SPEC-wf-042) that match the touched paths — a matching scope glob
   is authoritative inclusion. Read the **full text** of the selected items into
   context. If relevance is unclear (unfamiliar area, large blast radius), spawn a
   read-only **spec-discovery subagent** to sweep the corpus and return the
   governing items. If the discovery subagent is unavailable (tool denied or
   failed), fall back to index-plus-reasoning and **say so in your report** —
   discovery is never silently skipped.
2. **Run `sdd:work-item-close WI-{id}`** with those spec items in context.
3. **Self-check before done.** Before the work item is marked done, verify the
   diff against every selected cross-domain spec item, not just the gap's own
   acceptance criteria (work-item-close performs the acceptance-criteria
   verification; this is the cross-domain layer on top).

### Phase 4 — Guardian audit

After all work items are closed and their tests pass, before reporting complete:

1. **Regenerate the index** (`node plugin/scripts/spec-index.js`) — specs may have
   changed mid-run; re-globbing beats trusting the Phase 0 snapshot.
2. **Diff everything this run changed** against the recorded start point:
   ```bash
   git diff --name-only {start-point}
   ```
3. **Map changed files to governing spec items across ALL domains** (regenerated
   index + `scope:` globs + reasoning), not only the audited domain.
4. **Audit each change** against its governing items.
   - **Own-run violations** (introduced by this run's own changes): **fix inline**
     and re-run Phase 4. Do **not** write gap artifacts for your own fresh work.
   - **Escalate to the team lead** — instead of reporting complete — when a fix
     **requires judgment**: two spec items in tension, a fix that would alter merged
     behavior outside this run's scope, or **two fix → re-audit cycles without
     convergence**. Quote both items and describe the tension.
   - **Pre-existing violations** (not from this run's diff): **report them to the
     lead as candidate gaps** — do not fix them inline and do not block completion
     on them.
5. **Report complete only on a clean guardian audit.**

## Stop conditions and reporting

Stop only on one of:
- **Nothing to do** — Phase 1 found no gaps, or Phase 2 produced no work items.
- **Complete and clean** — all work items closed, Phase 4 audit clean.
- **Escalation** — a guardian-audit violation whose fix requires judgment.

Report to the team lead at exactly these moments (plus the Phase 0 handshake and
the Phase 1 gap list). Do not send interactive-style status pings between stages.

**Every factual claim in a completion or guardian report** must be
verified against the current tree at reporting time — never restated from
memory or assumed state. Claims covered: file states, commit hashes,
test counts, tree cleanliness.

## Constraints

**Execution never modifies spec item files.** A fix requiring a spec item edit is
an escalation — report it to the lead rather than closing inline. The only permitted
spec-file writes during execution are the mechanical annotations (`**Tests:**`
linking and `scope:` backfill per SPEC-wf-042) and their version-hash recomputation;
these never touch invariant or acceptance-criteria content and are excepted.

---
Next: Review the resulting SDD state. Run `/sdd:session-start` to review state.

_On escalation instead of completion, the final line is the blocker description
(the spec items in tension and why the fix needs judgment), not the session-start
suggestion._

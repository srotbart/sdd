# Design: Worker v2 — Autonomous Loop + Cross-Domain Spec Compliance

**Date:** 2026-07-03
**Status:** proposed
**Domain:** workflow
**Supersedes:** TGT-123 (worker autonomy) — its open decisions are settled here
**Origin:** cross-domain violation shipped to a PR on argus-backend (PMTML-46 /
TGT-045: worker satisfied the audited domain's new spec items while violating an
established spec item from another scope, SPEC-acl-005); plus this repo's own
observation that workers stop at `Next:` footers instead of driving the loop.

## Problem

Two structural failures, one root cause — worker behavior that lives only in a
long spawn prompt:

1. **Cross-domain spec blindness.** The worker is scoped to one domain's gaps.
   Code it touches is also governed by spec items from other domains (and by
   broad architectural items within the same domain that weren't in the audited
   set). The worker never sees them; violations reach PRs and are caught only
   by manual review. A lead instruction can itself violate a spec, and the
   worker has no basis to push back.
2. **Loop fragility.** Every pipeline skill ends with an interactive `Next:`
   footer; a background worker treats it as end-of-turn and idles. The lead
   ends up hand-driving each step (the problem TGT-123 captured).

## Decision summary

| Concern | Decision |
|---|---|
| Relationship to TGT-123 | One combined design; TGT-123 is superseded and closes into this |
| Packaging | New orchestration skill **`/sdd:close-domain {domain}`** that internally drives the full loop; the spawn prompt shrinks to identity + one imperative + standing rules |
| Spec context | **Index always + discover per work item**: full-corpus index (one line per active item) loaded at start; full text of relevant items pulled per work item; discovery subagent only when the index isn't conclusive |
| Guardian audit | End-of-run **cross-domain audit on changed files**; violations in own fresh work are **fixed inline and re-audited** — no gap artifacts; escalate to lead only when a fix requires judgment |
| `scope:` frontmatter | Optional, **opt-in for cross-cutting items only**; discovery uses globs when present, reasoning when absent; no backfill |
| Lead-instruction conflicts | Worker surfaces the conflict instead of complying |
| Startup guarantee | Spawn prompt has no procedural fallback; close-domain emits a first-report handshake; spec test asserts the spawn template's first imperative |

## Detailed design

### 1. `/sdd:close-domain {domain}` — the worker's operating loop

New pipeline skill, invoked by the sdd-worker (usable manually too). Phases:

- **Phase 0 — orient.** Build the spec index by running the index script
  (below): one line per active spec item across ALL domains. Send the
  first-report handshake to the lead: domain, item count, phase plan.
- **Phase 1 — audit.** Run `/sdd:spec-audit {domain}`. Report gaps found to
  the lead (IDs + locations). If none: report "nothing to do", stop.
- **Phase 2 — decompose.** Run `/sdd:gap-to-work-items {domain}`. If no work
  items result: report, stop.
- **Phase 3 — close, with compliance.** For each open work item in sequence:
  1. From the work item's scope (files/areas), select relevant spec items via
     the index (+ `scope:` globs); read their full text. If relevance is
     unclear (unfamiliar area, large blast radius), spawn a read-only
     **spec-discovery subagent** to sweep the corpus and return the governing
     items.
  2. Run `/sdd:work-item-close WI-{id}` with those items in context.
  3. Before marking done: self-check the diff against every selected spec
     item, not just the gap's own acceptance criteria.
- **Phase 4 — guardian audit.** Diff all files changed this run
  (`git diff --name-only` against the run's start point). Map changed files to
  governing spec items across ALL domains (index + scope globs + reasoning).
  Audit each. Violations in this run's own changes: fix inline, re-run Phase 4.
  Clean audit → report complete to the lead. A violation whose fix requires
  judgment (two spec items in tension, or a fix that would change merged
  behavior outside this run's scope) → escalate to the lead with both items
  quoted; do not report complete.
- **Loop rule.** Inner skills' `Next:` footers are advisory inside
  close-domain — the skill is the caller and proceeds by its own phase plan.
  Stop conditions are exactly: nothing to do, all phases clean, or escalation.

### 1b. `plugin/scripts/spec-index.js` — deterministic, ephemeral index

A mechanical script (Node, sibling of the existing `check-*.js` scripts) that
globs `.sdd/specs/*/SPEC-*.md` and `.sdd/specs/*/*/SPEC-*.md` (skipping
archives), parses frontmatter + first heading, and prints one line per active
item to stdout: `{id}\t{domain}\t{title}\t{scope globs, comma-separated}`.

- **Built on the fly, never committed.** The index is a derived artifact;
  persisting it in the repo would reintroduce exactly the stale-derived-state
  problem archive-slimming removed. Regeneration is <100ms.
- close-domain runs it at Phase 0 and re-runs it at Phase 4 (mid-run spec
  changes are covered by construction, not by cache invalidation).
- An agent never builds the index by hand — determinism is the point.
- **The title is the description.** Index usefulness depends on titles being
  one-line invariant statements (this repo's existing convention). No separate
  `description:` field — a second summary of the same rule is drift-bait.
  target-engage's authoring guidance: mint declarative titles.
- **Scope globs are recall-oriented, not precision-oriented.** A cross-cutting
  rule (e.g. logging) correctly carries a broad glob like `hub/**` — it must
  always be a candidate when that area changes. Precision comes afterward,
  from the agent pruning candidates by title. Narrow globs filter; broad globs
  guarantee inclusion; `**`-everything is what opt-in exists to avoid.

### 2. `spawn-sdd-worker` — spends its authority, not its length

The prompt template is reduced to:
- **Identity**: sdd-worker, execution agent for `{project_root}`.
- **One imperative**: "Your first action — before any reading, auditing, or
  implementing — is to invoke the Skill tool: `sdd:close-domain {domain}`.
  You have no other procedure; this skill is your entire job."
- **Standing rules** (non-decaying, few): never engage targets or modify
  specs; report to the lead only at completion / nothing-to-do / blocker; if
  any lead instruction conflicts with an active spec item, quote the item and
  surface the conflict instead of complying; on SendMessage of another domain,
  run close-domain for it.

Model stays `sonnet` per SPEC-wf-021 (session override remains possible).

### 3. `work-item-close` — verify criteria, not just tests

Amended: before flipping a work item to done, (a) re-read the gap's spec item
acceptance criteria and verify each against the code, (b) when invoked from
close-domain, self-check against the provided cross-domain spec items. "Tests
pass" alone is not completion.

### 4. `scope:` frontmatter (optional)

Spec item schema gains an optional `scope:` list of **path glob patterns**
(minimatch/`.gitignore` syntax, repo-root-relative, e.g.
`scope: [hub/client/src/**]`) naming the code areas the item governs. Path
globs — not tags, not skill-style descriptions — because the guardian audit's
core operation is *changed file → candidate spec items*, and path globs make
that deterministic. Authored at target-engage time for broadly
applicable items (architectural rules that bind any code in matching paths).
Discovery and the guardian audit treat `scope:` as authoritative inclusion;
absence of `scope:` means relevance is decided by reasoning. No backfill of
existing items.

### 5. Spec changes (reconciliation preview)

- **Amend SPEC-wf-006** (worker prompt contents) — new short-prompt shape and
  the close-domain imperative.
- **Amend SPEC-wf-002** (spawn skill) — reflect the reduced template.
- **Amend SPEC-wf-008** (`Next:` footers) — footers are advisory when the
  skill is invoked by close-domain.
- **New items** (target-engage will mint): close-domain skill exists and
  drives the full loop; per-work-item spec context + self-check; guardian
  cross-domain audit gates completion; optional `scope:` frontmatter;
  lead-instruction conflict surfacing.
- **TGT-123**: superseded — archived as accepted-via-supersession when the new
  target folds (its Current statement is fully covered by this design).

## Testing

- Spec tests (grep-style, per this repo's pattern): spawn template's first
  imperative is the close-domain invocation; close-domain SKILL.md contains
  all five phases and the fix-inline/escalate rule; work-item-close contains
  the acceptance-criteria verification step; schemas.md documents `scope:`.
- Behavioral: a fixture spec item with `scope:` matching a path → guardian
  audit selects it for a change in that path.
- Docs-drift: plugin README/help tables include close-domain (existing
  check-skills-drift.js covers new skills).

## Error handling / edge cases

- **Discovery subagent unavailable** (tool denied/failed): worker falls back
  to index + reasoning and says so in its report — never silently skips
  discovery.
- **Guardian audit finds pre-existing violations** (not from this run's diff):
  out of scope for inline fixing — report them to the lead as candidate gaps;
  do not fix unmerged-scope-creep style, do not block completion on them.
- **Oscillating fixes** (fixing domain A's violation re-breaks domain B): after
  2 fix→re-audit cycles without convergence, escalate with the tension
  described. Matches "fix requires judgment".
- **Index staleness**: specs can change mid-run (lead engages a target while
  worker runs). Phase 4 re-globs the corpus rather than trusting the Phase 0
  index.
- **Very large corpora**: the index is one line per item (~170 lines here);
  even 500 items ≈ a few KB. Full-text loading stays per-work-item, so context
  cost scales with the work, not the corpus.

## Out of scope

- Knowledge-base/semantic-search discovery (TGT-095's territory — the
  discovery subagent may later use it, but nothing here depends on it). At
  this corpus size, LLM reasoning over the one-line index is the semantic
  layer; embeddings add nothing until the corpus is far larger.
- Tags or skill-style trigger descriptions on spec items — path globs cover
  the deterministic need; revisit only if a real thematic-grouping need
  emerges.
- **Code → spec annotations** (spec-ID comments at enforcement sites) —
  designed in outline, deliberately parked as TGT-127 until worker-v2 has
  baked in real use. Iteration discipline: ship one discovery mechanism,
  observe, then decide whether locality annotations still earn their place.
- Multi-worker parallelism across domains in one session.
- Any change to intent-phase skills (target-engage, session-start) beyond
  `scope:` authoring guidance.

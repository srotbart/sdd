# Design: Conventions Domain — Standards Become Spec Items

**Date:** 2026-07-03
**Status:** proposed — **ship gate: hold engage until worker-v2 (PR #21) has
completed at least one real close-domain cycle** (iteration philosophy: one
mechanism bakes before the next rides on it)
**Domain:** workflow (governance) + new `conventions` domain (content)

## Problem

Coding conventions live in `.sdd/standards/standards-template.md`, a separate
artifact with its own enforcement wiring (SPEC-wf-028/029: session-start
surfaces it, linters block, reviewers use it as rubric). Two failures:

1. **The worker never sees it.** Layer-1 enforcement is session-start — an
   intent-phase skill the worker is prohibited from running. The agent doing
   most of the writing has the standards only if a spawn prompt remembers them.
2. **Second artifact, second set of sync rules.** CLAUDE.md pointer, reviewer
   rubric wiring, drift discipline — all duplicated relative to what spec items
   already get for free (versioning, hub display, audit, discovery, tests).

Worker-v2 (SPEC-wf-038..042) built exactly the machinery conventions need:
a full-corpus index, `scope:` path globs with recall-oriented matching,
per-work-item discovery, and a guardian audit gating completion.

## Decision summary

| Concern | Decision |
|---|---|
| Home | New spec domain `conventions` (abbrev `conv`), ordinary spec items |
| Bar | Every convention passes the normal spec-item bar: verifiable Invariant + Acceptance criteria. If acceptance criteria can't be written, it was never enforceable — reword or drop |
| `scope:` | **Mandatory** in this domain (conventions are inherently path-scoped); recall-oriented broad globs are correct |
| Auditability | **Fully auditable** — `/sdd:spec-audit conventions` is a normal audit minting gaps (file:line-cited). No special cases; uniformity is the point |
| Mechanical rules | Routed to linters/tsconfig, not spec items — a spec item duplicating a linter is drift-bait |
| `.sdd/standards/` | Retired (deleted; content preserved in git history). SPEC-wf-028 deprecated with a successor item; SPEC-wf-029 amended (three layers survive, layer 1 becomes index/discovery) |
| Reviewer severity notes | Moved into the review-issues skill (they are reviewer procedure, not invariants) |
| Authorship | Unchanged: conventions are **user-authored intent**, negotiated via targets — the agent does not invent them |
| Ship gate | Design + draft target now; engage only after worker-v2 has one real cycle |

## Migration table — current standards → destinations

### → Linters / tsconfig (mechanical; work item wires or confirms tooling)

| Rule | Destination |
|---|---|
| 2-space indent, no tabs | editor/lint config |
| TS strict, noUnusedLocals/Params | already enforced by tsconfig — no action |
| Import order (Node → third-party → local), ESM `.js` extensions | eslint import rules (verify tooling exists; wire if absent) |
| `const` over `let`, no `var` | eslint `prefer-const` / `no-var` |
| No `any` without justifying comment | eslint `no-explicit-any` with comment escape |

### → `SPEC-conv-*` items (verifiable judgment/architecture; proposed set — final minting at engage)

| Proposed item | Rule | scope |
|---|---|---|
| conv: markdown rendering | All markdown through shared `Markdown` component; `dangerouslySetInnerHTML` forbidden | `hub/client/src/**` |
| conv: duplication ceiling | No non-trivial code shape repeated across 3+ sites — extract shared helper/component | `hub/**`, `plugin/**` |
| conv: explicit errors | No silent `catch {}` without an intent comment | `hub/**` |
| conv: input validation | Externally-supplied input (paths, query params) validated before use | `hub/server/**` |
| conv: file layout | `PascalCase.tsx` components / `camelCase.ts` utils / co-located `*.test.ts(x)` | `hub/client/src/**` |
| conv: shared components | Screens compose `Markdown`/`StatusPill`/`ArtifactList`/`ArtifactIdLink`/`ArchiveFooter`/`TestStatusDot` rather than re-implementing; structural-clone screens share a parametrised component | `hub/client/src/**` |
| conv: thin handlers | Route dispatch via per-route handlers + shared guards; no god-function if-chains | `hub/server/**` |
| conv: single source | A mechanism or derivation rule used in 2+ places (incl. server+client) has one definition | `hub/**` |
| conv: guarded side effects | File I/O / network / process-spawn failures cannot crash the process | `hub/server/**` |

### → Dropped or already covered

| Rule | Disposition |
|---|---|
| "Prefer early return" | Unverifiable preference — dropped (rewordable later if it earns criteria) |
| "One concern per file" | Unverifiable as stated — dropped (duplication ceiling + thin handlers cover the enforceable part) |
| ID numbering from active+archive | Superseded by SPEC-wf-037 (hash IDs) |
| Spec items link tests via `**Tests:**` | Already workflow-spec territory (SPEC-wf-022 / spec-test) |
| Reviewer Notes severity table | Moves into review-issues SKILL.md |

## Governance changes (workflow domain)

- **SPEC-wf-028 → deprecated** (its invariant — "standards are not spec items,
  live outside the spec" — is inverted). Successor item (new, workflow domain):
  *"Coding conventions are user-authored spec items in the conventions domain"* —
  keeps the user-as-source-of-truth clause, mandates the verifiability bar and
  mandatory `scope:`, and routes mechanical rules to linters.
- **SPEC-wf-029 → amended**: three enforcement layers survive with new
  mechanics — (1) proactive: conventions items reach the worker via the spec
  index + discovery + guardian audit (worker-v2), and session-start's
  orientation names the domain; (2) active blocking: linters + lint-check
  unchanged; (3) review-time: review-issues uses the conventions domain as its
  rubric (severity table lives in that skill).
- **CLAUDE.md**: standards section rewritten to point at
  `.sdd/specs/conventions/`.
- **review-issues / review-improvements SKILL.md**: rubric source updated;
  severity table embedded.
- **`.sdd/standards/`**: directory deleted (git history preserves it).

## Testing

- Spec tests: successor item asserts `.sdd/standards/` is absent and the
  conventions domain exists with every item carrying `scope:`; review-issues
  SKILL.md references the conventions domain + contains the severity table;
  CLAUDE.md contains no standards-template pointer.
- spec-index output includes conv items with their scope globs (existing
  SPEC-wf-039 fixture pattern extends naturally).
- Each minted SPEC-conv item gets its own coverage per normal spec-test flow
  (several are grep-verifiable: dangerouslySetInnerHTML absence, silent-catch
  scan).

## Edge cases

- **Convention vs behavior overlap**: if a convention hardens into product
  behavior (as ID-numbering did), it migrates to the owning domain via the
  normal target flow — conventions domain is not a dumping ground for behavior.
- **Audit noise control**: conv gaps must cite concrete file:line violations
  (existing gap discipline); "the codebase vibe is off" is not a gap.
- **Broad scopes**: `hub/**` on cross-cutting items is correct (recall-
  oriented, SPEC-wf-042); the agent prunes candidates by title.
- **Linter absence**: if eslint isn't wired in hub yet, the mechanical bucket
  becomes one work item to wire it — not a reason to spec mechanical rules.

## Out of scope

- Any new discovery machinery (worker-v2 provides all of it).
- Backfilling `scope:` onto non-conventions domains.
- Code→spec annotations (TGT-127, parked).
- Engaging before the bake gate clears.

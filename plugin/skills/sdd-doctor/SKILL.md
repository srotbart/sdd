---
name: sdd-doctor
description: This skill should be used when the user invokes `/sdd:sdd-doctor`, says "check SDD health", "validate the .sdd directory", "is my spec tree consistent", "run the sdd doctor", "fix the sdd structure", or wants an agent focused on the health of `.sdd/` itself — artifact schemas, structure, version hashes, references, and archive hygiene — rather than the project code. Applies mechanical fixes directly and reports judgement calls.
version: 0.1.0
---

# SDD Doctor

The doctor's subject is `.sdd/` itself, not the project code. Where the
sdd-worker closes gaps between spec and *code*, the doctor closes gaps between
the SDD artifacts and their *own schema*: structure, frontmatter, version
hashes, references, and archive hygiene. It keeps the pipeline's substrate
stable so every other skill can trust what it reads.

Run it directly, or spawn it as a persistent background agent (mirroring the
sdd-worker pattern) with `/sdd:sdd-doctor spawn`.

## Input

- **No argument**: run the full health check on `.sdd/`, apply mechanical
  fixes, report everything else.
- **`check`**: report-only mode — diagnose, fix nothing.
- **`spawn`**: spawn a persistent agent named `sdd-doctor` (see Spawning below).

## The checks

Run all ten, in order. Each check yields findings classified **mechanical**
(the fix is unambiguous — apply it directly, except in `check` mode) or
**judgement** (report; never guess).

### 1. Structure

- Every active artifact lives in its type's directory (`targets/`, `specs/`,
  `gaps/`, `work-items/`, `issues/`, `improvements/`), not somewhere else.
- Every spec item's `component:` path matches the directory it sits in
  (legacy `domain:` items in a flat one-level layout are valid — note them as
  migration candidates, not errors; suggest `/sdd:migrate-components`).
- No component directory is named `archive`; manifests (`component.md`,
  `area.md`) are not parsed as spec items.
- **Mechanical fix:** none — misplaced files are judgement (the right home may
  not be obvious). Report with the suggested `git mv`.

### 2. Schema / frontmatter

For every artifact, validate required frontmatter per its guide
(`references/artifacts/{type}.md`): required fields present, `status` within
the type's enum, timestamps parseable, `aliases`/`scope` are lists.

- **Mechanical fix:** add a missing null-default field (`closed-by: null`,
  `deferred-reason: null`, `abandoned-reason: null`, `aliases: []`).
- **Judgement:** missing identity fields (`id`, `spec-item`, `gap-id`,
  `component`/`domain`), unknown status values.

### 3. Spec version hashes

Run the stamping script in check mode — it verifies every item and binding
deterministically (`node plugin/scripts/stamp.js check --all`, resolving the
script from the repo or the plugin cache; fall back to
`grep -v "^version:" {file} | shasum -a 256 | cut -c1-8` per file only if the
script is unavailable).

**Legacy hashes cannot be verified post-hoc.** Older projects hashed the
whole file (`shasum -a 256 {file}`) *before* writing the hash in, so the
stored value is part of the content it would need to hash — unverifiable
after the fact. Unmigrated projects still *function*: stale-gap detection
compares stored-vs-stored values and never recomputes, so it stays
self-consistent regardless of convention. That is why a mass restamp is
never automatic — rewriting hashes flips every open gap's
`audit-spec-version` comparison to stale across the whole project in one
run, with no underlying spec change.

- **Isolated mismatches** (a few items on an otherwise-verifying project):
  mechanical fix — restamp each with
  `node plugin/scripts/stamp.js version {file}` (the recompute-on-write rule;
  the content is the truth) and note that open gaps on those items now
  correctly read stale.
- **Widespread mismatches** (most of the tree fails — a legacy-convention or
  historically-unstamped project): report the count and recommend a
  deliberate one-time `stamp.js version --all` followed by a re-audit.
  **Never apply it as a mechanical fix.**

### 4. ID integrity

- No two active artifacts of the same type share an `id`.
- Every file's name matches its frontmatter `id`.
- Every component manifest `abbrev` is unique across the tree; flag item files
  whose abbrev matches no component manifest **only when** manifests exist
  (unmigrated projects have none — not an error).
- **Mechanical fix:** none — duplicate IDs are judgement (which one renames
  depends on history). Report both paths.

### 5. Reference resolution

- Every gap's `spec-item` resolves: `node plugin/cli/sdd.js resolve {ID}`
  (or the installed plugin cache copy) — covers active items, `aliases:`
  fields, and the tracked spec archive in one lookup.
- Every work item's `gap-id` resolves against active gaps, or — because
  ephemeral archives are local-only — reports as **unverifiable (archive is
  local-only)** when the local archive cache is empty or absent; a genuine
  orphan only when the cache is present and lacks it (same semantics as
  session-start).
- `closed-by` on closed gaps names a work item that exists actively, in the
  local cache, or is unverifiable — same rule.
- **Judgement:** all orphans. Never delete or auto-close an orphaned artifact.

### 6. Terminal-state hygiene

Terminal artifacts sitting in active directories (`closed`/`accepted`/`deferred`
gaps, `done`/`abandoned` work items, `accepted`/`archived` targets,
`accepted`/`dismissed` issues/improvements) should have been archived.

- **Mechanical fix:** commit the terminal state, then `mv` to the type's
  `archive/` — the standard write → commit → move order. Never stage files
  under an ephemeral `archive/` path.

### 7. Stale audits

Compare each open gap's `audit-spec-version` to its spec item's current
`version`. Staleness is **reported, never fixed** — refreshing a stale gap is
the worker's job (`/sdd:spec-audit`), not the doctor's.

### 8. Manifest integrity

Where component manifests exist: `component:` matches the directory; `scope:`
globs are syntactically valid; `depends-on:` entries name existing components;
every component directory containing spec items has a `component.md`.

- **Mechanical fix:** none — write a missing manifest only if its content is
  fully derivable (path + abbrev shared by all member items); otherwise report.

### 9. Binding drift and integrity

For every contract item (frontmatter `contract-consumer` +
`contract-synced`, see `references/artifacts/spec.md`):

- **Malformed bindings are reported:** a `contract-consumer` naming no known
  component, a `contract-synced` entry that doesn't parse as
  `{spec-item-id}@{hash}`, a **self-stamp** (the contract item referencing
  itself — can never converge; see the spec guide), an empty
  `contract-synced`, or a referenced spec item that can't be found (active,
  alias, or tracked spec archive).
- **Drift is reported, never fixed:** compare each stamp to the referenced
  item's current `version`. Producer- or consumer-drifted bindings route to
  the worker — re-stamping requires re-verifying the contract against both
  sides, which is verification work, not hygiene. The doctor only surfaces
  the edge and which side moved.

### 10. Leftover process files

Flag lingering `COLLAPSE-*.md` / `MIGRATE-*.md` proposals older than 30 days,
`.conflict.md` files whose target is no longer active, and `.tests.json`
mapping files that are malformed JSON or missing `report`/`items` keys (these
crash consumers — report prominently).

## Report

```
## SDD Health — {date}

### Fixed (mechanical)
- SPEC-hsrv-003: version recomputed a3f9c812 → 7bc41e09
- GAP-wf-a3f8c21: closed but unarchived → committed + archived
- WI-wf-5c3f2a8: missing abandoned-reason → set null

### Needs judgement
- ⚠ GAP-auth-005 references SPEC-auth-009 — not found in active items, aliases, or spec archive
- ⚠ abbrev "scr" declared by hub/client/screens and hub/screens — spec IDs would collide

### Stale (run the worker, not the doctor)
- GAP-hcli-91bd202 stale vs SPEC-hcli-004 (a3f9c812 ≠ c4e1f205) → /sdd:spec-audit hub/client
- binding SPEC-hsrv-012 → hub/client consumer-drifted (SPEC-hcli-004 9921bc0d ≠ c4e1f205) → re-verify + re-stamp

### Clean
- {N} artifacts checked; structure, IDs, references OK

---
Next: {highest-priority follow-up, e.g. "Run /sdd:spec-audit hub/client to refresh 3 stale gaps."}
```

In `check` mode the "Fixed" section becomes "Would fix (mechanical)".

## Spawning (`/sdd:sdd-doctor spawn`)

Mirror the sdd-worker pattern. Use the Agent tool with:

- `name`: `"sdd-doctor"`
- `subagent_type`: `"general-purpose"`
- `model`: `"sonnet"` (the checks are mechanical given the guides)
- `run_in_background`: `true`

Prompt for the agent (substituting `{project_root}`):

```
You are sdd-doctor, an autonomous SDD health agent for the project at
{project_root}. Your subject is the .sdd/ directory itself — never the project
code, and never the content of any invariant.

Your first action — before any reading or fixing — is to invoke the Skill
tool: sdd:sdd-doctor

That skill is your entire job: its ten checks, its mechanical/judgement
split, its report format. Do not reconstruct the checks from memory.

Standing rules:
- Apply mechanical fixes exactly as the skill defines them; nothing broader.
- Never edit an invariant, acceptance criterion, target dialog, or gap
  reasoning. Schema and hygiene only.
- Never delete an artifact. Archiving follows write → commit → move.
- Report judgement findings to your team lead; do not resolve them yourself.
- On receiving "recheck" via SendMessage, run sdd:sdd-doctor again. Reuse this
  same agent — do not expect to be re-spawned.
```

If a doctor is already running in the session, SendMessage "recheck" instead of
spawning a second one.

## Constraints

- **The doctor never authors intent.** No target, invariant, or acceptance
  criterion is ever created or edited. The only spec-file writes are the
  mechanical ones defined above (version recompute, null-default fields).
- **The doctor never closes the spec-vs-code loop.** Stale gaps and failed
  audits route to the worker; the doctor only surfaces them.
- **Report everything it touched.** Every mechanical fix appears in the report
  with before → after.
- **Deterministic checks.** Same tree in, same findings out — no sampling, no
  "looks fine".

## Schema Reference

Artifact guides are the rulebook the doctor enforces:
`references/artifacts/{target,spec,gap,work-item}.md`, `references/schemas.md`

# Design: SDD Archive Slimming

**Date:** 2026-07-02
**Status:** proposed
**Domain:** workflow (primary), architecture (hub touch-points)

## Problem

Terminal SDD artifacts (archived targets, closed gaps, done work-items, resolved
issues/improvements) accumulate in git forever — currently 483 files (~1.7MB)
under `.sdd/*/archive/`. This produces:

1. **Review noise** — PR "Files Changed" views cluttered with artifact moves.
2. **Diff size** — artifact content inflates PR diffs for tooling and agent review.
3. **Unbounded accumulation** — main's tree grows with every closed work cycle.

The end-state we want: a repo that is properly spec'ed, where the only SDD
artifacts under version control are the **permanent truth** (specs, standards)
and the **in-flight temporaries** for upcoming changes (open targets, gaps,
work-items, issues, improvements). Terminal artifacts are scaffolding whose
value is consumed at merge; they do not need to remain in the working tree —
but they must stay *recoverable* (git history serves as the permanent archive).

## Decision summary

| Concern | Decision |
|---|---|
| Terminal artifacts | `mv` to `*/archive/` as today, but archive dirs are **gitignored** — local safety net only, never committed or pushed |
| Existing 483 tracked archive files | Untracked in the migration PR (`git rm -r --cached`); remain on disk locally |
| IDs — ephemeral types (GAP, WI, ISS, IMP) | Random 7-hex hash IDs: `{PREFIX}-{abbrev}-{7hex}` (e.g. `GAP-wf-3f9c2a1`); minted with zero lookup; recycling impossible by construction |
| IDs — targets (TGT) | Stay sequential; max-seq = active files + `git log --diff-filter=A -- .sdd/targets/` history scan |
| IDs — specs (SPEC) | Unchanged, sequential; spec archive (deprecated/aliased items) **stays tracked** — it is permanent truth needed for alias resolution |
| Ledger / index of archived artifacts | **None.** Commit messages and PR descriptions are the provenance record |
| Long-term retention ("what if?") | Terminal state committed **before** archiving → git history holds full content of every artifact forever; `sdd:archive-recover <ID>` restores on demand. Requires merge-commit strategy (no squash) |
| Existing artifact IDs | Never renamed; both ID forms are valid everywhere |

## Detailed design

### 1. Gitignore + local archive cache

- `.gitignore` gains: `.sdd/targets/archive/`, `.sdd/gaps/archive/`,
  `.sdd/work-items/archive/`, `.sdd/issues/archive/`, `.sdd/improvements/archive/`.
  (Deliberately **not** `.sdd/specs/**/archive/` — spec archives stay tracked.)
- Archiving skills keep the current behavior — flip terminal state, `mv` the
  file into the type's `archive/` dir — with one new **hard invariant**: the
  artifact's terminal state MUST be committed before the `mv`. Every artifact
  is therefore committed at least twice (creation, terminal state), making
  **git history the permanent, complete archive**: full content of every
  artifact that ever existed, recoverable in any clone, forever. Deleting a
  tracked file never deletes its history.
- Recovery is wrapped in a helper (`sdd:archive-recover <ID>`):
  `git log --all --diff-filter=A -- ".sdd/{type}/{ID}.md"` to locate, then
  `git show <sha>:<path>` to read or restore into the local archive dir.
- **Merge-strategy constraint**: history completeness depends on PR branch
  commits reaching main — i.e. merge commits (current practice). Squash
  merging would erase artifacts created and closed within a single PR; if the
  merge strategy ever changes, this design must be revisited.
- Because Grep/Glob respect gitignore, archived content stops polluting agent
  searches; deliberate access (Read with explicit path, Bash, hub filesystem
  reads) still works.
- The cache is disposable: it exists only on the machine where the artifact was
  closed. Fresh clones and worktrees start with empty archives. Nothing may
  depend on archive contents being present.

### 2. ID scheme

**Ephemeral types** — new gaps, work-items, issues, improvements mint:

```
{PREFIX}-{domain-abbrev}-{7 lowercase hex chars}   e.g. GAP-wf-3f9c2a1
```

- Source of randomness: any (e.g. `openssl rand -hex 4 | cut -c1-7` or
  `$RANDOM`-seeded); no uniqueness check required (268M values, ~500 artifacts
  lifetime — collision odds negligible), though minting MAY check active files
  as belt-and-braces.
- Parallel workers in separate worktrees can mint with zero coordination.

**Targets** — remain `TGT-{seq}`. Max-seq is computed from active target files
plus a git-history scan (`git log --diff-filter=A --name-only --format= --
.sdd/targets/`). Targets reliably enter history because negotiation spans
sessions/PRs. Known constraint: shallow clones cannot see historical IDs;
target minting must run in a full clone (always true for dev sessions).

**Specs** — unchanged.

**Existing IDs** are never renamed. All consumers must accept both forms:
`\d{3}` and `[0-9a-f]{7}` in the trailing segment.

### 3. Provenance without archives

- Commit messages and PR descriptions continue to name the artifact IDs they
  close (existing convention, e.g. `fix(sdd): … (ISS-wf-004, ISS-wf-002)`).
- Orphan/reference checks (session-start, work-item-close) resolve against
  **active files, then the local archive cache, then git history**
  (`git log --diff-filter=A -- <path>` — cheap, and complete thanks to the
  commit-before-archive invariant). Only a reference found in none of the
  three is a true orphan error.
- Spec alias resolution keeps working — spec archives remain tracked.

### 4. Skill and tooling changes

| Surface | Change |
|---|---|
| `work-item-close`, `target-engage`, `review-engage` (archiving flows) | Enforce commit-terminal-state-before-`mv` invariant; stop staging archive paths |
| New: `sdd:archive-recover` helper (skill or script) | Locate an archived artifact in history and restore it into the local archive dir |
| `session-start` | Replace archive globbing with: local-cache read when present, else omit archived counts; ID-numbering guidance updated (hash for ephemeral, history-scan for TGT); new warning when two active artifacts share an ID |
| `spec-audit`, `gap-to-work-items`, `review-issues`, `review-improvements` (minting flows) | Mint hash IDs for ephemeral types |
| `plugin/scripts/lint-check.sh` | New check: fail if any **tracked** file exists under a gitignored archive path (backstop against `git add -f`) |
| Hub auto-link remark plugin | Widen ID regex to also match 7-hex suffixes for GAP/WI/ISS/IMP |
| Spec test-status wiring | Verify uppercase-ID key mapping is agnostic to suffix form |
| `references/schemas.md`, artifact guides | Document both ID forms and the local-only archive semantics |

### 5. Migration (one PR)

1. Add `.gitignore` entries and this design's skill/doc updates.
2. `git rm -r --cached .sdd/targets/archive .sdd/gaps/archive .sdd/work-items/archive .sdd/issues/archive .sdd/improvements/archive` — 483 files leave the tree, stay on local disk.
3. Update lint-check.sh, hub regex, skill docs, schemas.
4. Verify: `sdd:session-start` reports identical active state; hub renders and
   links both ID forms; lint backstop fires on a force-added archive file.

## Testing

- **ID minting**: format test for hash IDs; TGT max-seq test covering active +
  history (fixture repo with a deleted target in history).
- **Hub**: linkification unit tests for both ID forms (client test suite).
- **Lint backstop**: force-add a file under an ignored archive dir → lint fails.
- **Orphan checks**: work-item referencing a gap present only in the local
  cache → "unverifiable", not error; empty cache → same.
- **Recovery**: archive an artifact (with the terminal-state commit), delete
  the local archive copy, run `archive-recover` → full content restored.
- **Migration proof**: post-merge main contains zero files under ephemeral
  archive paths; spec archive intact.

## Error handling / edge cases

- **`git clean -fdx`** wipes local archive caches — acceptable by design; the
  cache is a convenience, never a dependency.
- **Concurrent PRs** minting ephemeral IDs: no coordination needed (hash).
  Concurrent target creation: both PRs history-scan at creation time; the
  second to merge could theoretically duplicate a TGT seq if minted in the
  same window — acceptable residual risk (targets are user-initiated and rare);
  detected by session-start duplicate-ID warning.
- **Durability is conditional on merge**: history-as-archive is permanent only
  for commits that reach main. Artifacts on abandoned/unpushed branches die
  with the branch — acceptable: they describe work that never landed, and they
  are exactly as safe as the code changes on the same branch. Local history
  rewriting (rebase/squash dropping artifact commits before push) would erase
  them — same constraint as the merge-strategy rule: don't rewrite artifact
  commits away.
- **Shallow clones**: TGT minting requires full history; document as constraint.
- **Old references in specs/commits** to archived artifacts (e.g. a spec
  mentioning `GAP-arch-001`): remain as inert historical text; hub renders them
  as plain (unlinked or dead-link tolerant) when the file is absent.

## Out of scope

- Renaming existing artifacts to hash IDs.
- Any archive branch, ledger, or merge-time sweep (considered and rejected in
  brainstorming: git history + the commit-before-archive invariant already
  provide durable retention without extra machinery).
- Changes to spec/standards storage.

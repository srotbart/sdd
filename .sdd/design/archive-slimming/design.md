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
value is consumed at merge; they do not need to be shared or preserved in git.

## Decision summary

| Concern | Decision |
|---|---|
| Terminal artifacts | `mv` to `*/archive/` as today, but archive dirs are **gitignored** — local safety net only, never committed or pushed |
| Existing 483 tracked archive files | Untracked in the migration PR (`git rm -r --cached`); remain on disk locally |
| IDs — ephemeral types (GAP, WI, ISS, IMP) | Random 7-hex hash IDs: `{PREFIX}-{abbrev}-{7hex}` (e.g. `GAP-wf-3f9c2a1`); minted with zero lookup; recycling impossible by construction |
| IDs — targets (TGT) | Stay sequential; max-seq = active files + `git log --diff-filter=A -- .sdd/targets/` history scan |
| IDs — specs (SPEC) | Unchanged, sequential; spec archive (deprecated/aliased items) **stays tracked** — it is permanent truth needed for alias resolution |
| Ledger / index of archived artifacts | **None.** Commit messages and PR descriptions are the provenance record |
| Existing artifact IDs | Never renamed; both ID forms are valid everywhere |

## Detailed design

### 1. Gitignore + local archive cache

- `.gitignore` gains: `.sdd/targets/archive/`, `.sdd/gaps/archive/`,
  `.sdd/work-items/archive/`, `.sdd/issues/archive/`, `.sdd/improvements/archive/`.
  (Deliberately **not** `.sdd/specs/**/archive/` — spec archives stay tracked.)
- Archiving skills keep the current behavior: flip terminal state, `mv` the file
  into the type's `archive/` dir. The file simply becomes untracked.
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
- Orphan/reference checks (session-start, work-item-close) are scoped to
  **active files plus the local archive cache when present**; a missing
  reference with an empty cache is reported as "unverifiable (archive is
  local-only)", not as an error.
- Spec alias resolution keeps working — spec archives remain tracked.

### 4. Skill and tooling changes

| Surface | Change |
|---|---|
| `work-item-close`, `target-engage`, `review-engage` (archiving flows) | No mv-flow change; drop any instruction implying archives are committed; stop staging archive paths |
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
- **Shallow clones**: TGT minting requires full history; document as constraint.
- **Old references in specs/commits** to archived artifacts (e.g. a spec
  mentioning `GAP-arch-001`): remain as inert historical text; hub renders them
  as plain (unlinked or dead-link tolerant) when the file is absent.

## Out of scope

- Renaming existing artifacts to hash IDs.
- Any archive branch, ledger, or merge-time sweep (considered and rejected in
  brainstorming: user requires no post-merge retention).
- Changes to spec/standards storage.

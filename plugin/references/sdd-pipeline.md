# SDD Pipeline

Spec-driven development shifts the workflow from telling agents what to do toward
declaring what must be true. Agents find the gaps and close them.

## Pipeline stages

```
── Intent phase (human + Claude) ──
User writes target
       ↓
target-engage: negotiate until ready
       ↓
target-engage: reconcile ready target with spec
  → no-op / extension / conflict (surfaced for review, never auto-merged)

── Execution phase (autonomous sdd-worker) ──
spawn-sdd-worker: spawn the persistent sdd-worker for a domain
       ↓
close-domain: drive the whole loop — the worker's entire job
  Phase 0  orient     — build the spec index, record the run's git start point
  Phase 1  audit      — spec-audit → gap report (file:line + one-line reasoning)
  Phase 2  decompose  — gap-to-work-items → scoped tasks
  Phase 3  close      — per work item: work-item-close (implement + tests),
                        with cross-domain spec self-check      ⟳ loops per work item
  Phase 4  guardian   — cross-domain audit of all changed files; own-run
                        violations fixed inline and re-audited
       ↓
Terminal: guardian audit clean, no open gaps, no pending work items
```

close-domain is invoked by the sdd-worker (and usable manually). Its inner skills'
`Next:` footers are advisory inside the loop; it proceeds by its own phase plan.

## Skill responsibilities

| Skill | Reads | Writes | Archives |
|---|---|---|---|
| session-start | all `.sdd/` | nothing | nothing |
| target-engage | target file, spec files | target file, spec files | target (on accepted/archived) |
| spec-audit | spec files, codebase | gap files | nothing |
| gap-to-work-items | gap files | work-item files | nothing |
| work-item-close | work-item file, gap file, codebase | codebase, work-item file, gap file | work-item (done), gap (closed) |
| spec-collapse | spec files | spec files (consolidation proposal) | nothing (proposal only) |
| spawn-sdd-worker | session state | spawns the persistent `sdd-worker` agent | nothing |
| close-domain | spec index, all `.sdd/`, codebase | via its sub-skills (gaps, work-items, code) | via work-item-close |
| spec-test | spec files, codebase, test suite | test files, spec `**Tests:**` blocks, `.tests.json` mapping | nothing |
| review-issues | codebase, spec files | issue files (`.sdd/issues/`) | nothing |
| review-improvements | codebase, spec files | improvement files (`.sdd/improvements/`) | nothing |
| review-engage | issue/improvement file, spec files | spec files or gap files | issue/improvement (on accepted/dismissed) |

## Key invariants

- **Specs are the source of truth.** All other artifacts reference spec item IDs.
- **Conflicts surface, never auto-merge.** When a ready target conflicts with the
  spec, target-engage produces a conflict artifact for user review before writing
  anything to the spec.
- **Audits are stamped per item.** Every gap records the `version` of the specific
  spec item it was generated against. Stale gaps are detectable by comparing
  `audit-spec-version` to the current `version` field in the referenced spec item file.
- **Stable IDs.** Spec item IDs, gap IDs, and work-item IDs are never recycled.
  Aliasing handles renames; migration of existing artifacts is never required.
- **Reasoning is visible.** Every gap includes a one-line justification.
  Verifiability over vibes.
- **Ephemeral archives are local-only.** The `archive/` subdirectories of targets,
  gaps, work-items, issues, and improvements are gitignored; the
  terminal state is committed *before* the `mv`, so git history — not the working
  tree — is the permanent record. Spec archives (`.sdd/specs/**/archive/`) stay tracked.
- **Ephemeral IDs are minted, not scanned.** Gaps, work-items, issues, and
  improvements mint `{prefix}-{abbrev}-{7hex}` hash IDs; legacy
  sequential `{seq}` forms remain valid. Targets and specs keep sequential IDs.

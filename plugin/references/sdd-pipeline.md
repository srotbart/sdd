# SDD Pipeline

Spec-driven development shifts the workflow from telling agents what to do toward
declaring what must be true. Agents find the gaps and close them.

## Pipeline stages

```
User writes target
       ↓
target-engage: negotiate until ready
       ↓
target-engage: reconcile ready target with spec
  → no-op / extension / conflict (surfaced for review, never auto-merged)
       ↓
spec-audit: enumerate relevant code paths, reason about each
  → gap report (file:line + one-line reasoning per location)
       ↓
gap-to-work-items: decompose gaps into scoped tasks
       ↓
work-item-close: implement one work item including tests
       ↓
Terminal: no open gaps, no pending work items
```

## Skill responsibilities

| Skill | Reads | Writes | Archives |
|---|---|---|---|
| session-start | all `.sdd/` | nothing | nothing |
| target-engage | target file, spec files | target file, spec files | target (on accepted/archived) |
| spec-audit | spec files, codebase | gap files | nothing |
| gap-to-work-items | gap files | work-item files | nothing |
| work-item-close | work-item file, gap file, codebase | codebase, work-item file, gap file | work-item (done), gap (closed) |
| spec-collapse | spec files | spec files (consolidation proposal) | nothing (proposal only) |

## Key invariants

- **Specs are the source of truth.** All other artifacts reference spec item IDs.
- **Conflicts surface, never auto-merge.** When a ready target conflicts with the
  spec, target-engage produces a conflict artifact for user review before writing
  anything to the spec.
- **Audits are stamped.** Every gap records the spec version it was generated
  against. Stale gaps are detectable by comparing `audit-spec-version` to the
  current spec hash.
- **Stable IDs.** Spec item IDs, gap IDs, and work-item IDs are never recycled.
  Aliasing handles renames; migration of existing artifacts is never required.
- **Reasoning is visible.** Every gap includes a one-line justification.
  Verifiability over vibes.

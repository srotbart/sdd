---
id: SPEC-scr-052
domain: ui-screens
abbrev: scr
status: active
aliases: []
version: "8d7e3161"
---

# SPEC-scr-052 — Sidenav active-artifact counts cover every artifact-bearing tab

## Invariant

The sidenav shows an active-item count badge next to **every** artifact-bearing navigation tab,
not just targets/specs/gaps/work-items. Building on SPEC-scr-018's non-archived counting rule,
the `tabCounts` prop assembled in `App.tsx` and consumed by `Sidenav` additionally provides
counts for **issues**, **improvements**, **projections**, **designs**, and **standards**. The
three non-artifact tabs (`session`, `activity`, `settings`) carry no count. Active semantics:
issues count entries whose status is `open` or `in-progress` (excluding `resolved`/`wont-fix`);
improvements count entries whose status is `open` or `in-progress` (excluding `done`/`wont-do`);
projections/designs/standards are status-less documents whose count is the number of documents
present (excluding any `archive/`), analogous to how specs count all domains. A zero count
renders no badge (the badge shows only when count > 0), and all counts update reactively as
workspace data changes.

## Acceptance criteria

- The sidenav renders an active-item count badge for the `issues`, `improvements`,
  `projections`, `designs`, and `standards` tabs, in addition to the existing
  `targets`/`specs`/`gaps`/`work items` badges (SPEC-scr-018)
- The `session`, `activity`, and `settings` tabs render no count badge
- Issues count = entries with status `open` or `in-progress` (excludes `resolved`, `wont-fix`)
- Improvements count = entries with status `open` or `in-progress` (excludes `done`, `wont-do`)
- Projections/designs/standards count = number of documents present for the active workspace
  (excluding any `archive/`)
- A tab whose active count is 0 shows no badge (consistent with the existing
  `count > 0` render guard)
- Counts are sourced in `App.tsx` into the `tabCounts` prop and update reactively when the
  underlying workspace data changes
- Existing SPEC-scr-018 behavior (targets/specs/gaps/work-items counts and their non-archived
  exclusions) is unchanged

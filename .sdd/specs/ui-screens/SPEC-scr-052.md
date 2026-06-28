---
id: SPEC-scr-052
domain: ui-screens
abbrev: scr
status: active
aliases: []
version: "c7760a36"
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

**Tests:**

- `hub/client/src/App.test.tsx > Sidenav tabCounts — issues, improvements, projections, designs, standards (SPEC-scr-052) > issues count badge shows active issues only (excludes resolved and wont-fix)` — issues badge counts open and in-progress, not resolved or wont-fix
- `hub/client/src/App.test.tsx > Sidenav tabCounts — issues, improvements, projections, designs, standards (SPEC-scr-052) > issues count badge is absent when all issues are resolved or wont-fix` — no badge when all issues are resolved/wont-fix
- `hub/client/src/App.test.tsx > Sidenav tabCounts — issues, improvements, projections, designs, standards (SPEC-scr-052) > improvements count badge shows active improvements only (excludes done and wont-do)` — improvements badge counts open and in-progress, not done or wont-do
- `hub/client/src/App.test.tsx > Sidenav tabCounts — issues, improvements, projections, designs, standards (SPEC-scr-052) > improvements count badge is absent when all improvements are done or wont-do` — no badge when all improvements are done/wont-do
- `hub/client/src/App.test.tsx > Sidenav tabCounts — issues, improvements, projections, designs, standards (SPEC-scr-052) > projections count badge shows number of projections documents` — projections badge reflects the document count
- `hub/client/src/App.test.tsx > Sidenav tabCounts — issues, improvements, projections, designs, standards (SPEC-scr-052) > designs count badge shows number of designs documents` — designs badge reflects the document count
- `hub/client/src/App.test.tsx > Sidenav tabCounts — issues, improvements, projections, designs, standards (SPEC-scr-052) > projections count badge is absent when there are no projections` — no badge when the projections list is empty
- `hub/client/src/App.test.tsx > Sidenav tabCounts — issues, improvements, projections, designs, standards (SPEC-scr-052) > standards count badge shows number of standards files` — standards badge reflects the file count
- `hub/client/src/App.test.tsx > Sidenav tabCounts — issues, improvements, projections, designs, standards (SPEC-scr-052) > session, activity, and settings tabs render no count badge` — non-artifact tabs show no count badge

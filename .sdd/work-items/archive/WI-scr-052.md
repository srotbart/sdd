---
id: WI-scr-052
gap-id: GAP-scr-001
domain: ui-screens
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Extend tabCounts in App.tsx with issues, improvements, projections, designs, and standards counts

**Scope:** `hub/client/src/App.tsx` — add `liveProjections`, `liveDesigns`, and `liveStandards` count state (fetched on workspace select), extend the `tabCounts` prop with `issues` (open/in-progress), `improvements` (open/in-progress), `projections`, `designs`, and `standards` document counts; add corresponding SPEC-scr-052 tests in `hub/client/src/App.test.tsx`.

**Acceptance criteria:**
- `tabCounts` passed to `Sidenav` includes keys for `issues`, `improvements`, `projections`, `designs`, and `standards`
- Issues count = `liveIssues` entries with status `open` or `in-progress` (excludes `resolved`, `wont-fix`)
- Improvements count = `liveImprovements` entries with status `open` or `in-progress` (excludes `done`, `wont-do`)
- Projections, designs, and standards counts are sourced from new state arrays populated by fetching the respective workspace endpoints on workspace select; counts equal the number of documents returned
- A tab with count 0 shows no badge (existing Sidenav `count > 0` guard is unchanged)
- Existing SPEC-scr-018 counts (targets/specs/gaps/work-items) are unchanged
- Test: sidenav `issues` count badge shows active-only issues count (excludes `resolved`/`wont-fix`)
- Test: sidenav `improvements` count badge shows active-only improvements count (excludes `done`/`wont-do`)
- Test: sidenav `projections` count badge shows the number of projections documents
- Test: sidenav `designs` count badge shows the number of designs documents
- Test: sidenav `standards` count badge shows the number of standards documents
- Test: zero-count tabs show no badge for each of the five new tabs
- Test: `session`, `activity`, and `settings` tabs render no count badge

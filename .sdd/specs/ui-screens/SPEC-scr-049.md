---
id: SPEC-scr-049
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "949a31cd"
---

# SPEC-scr-049 — Test indicators appear on each spec artifact list row

## Invariant

In the Specs screen, each spec artifact (per-domain) list row displays a single aggregate test-status indicator (a `TestStatusDot` reflecting the domain's rolled-up test status), so per-artifact coverage is visible directly while scanning the spec list. The indicator reuses the existing test-status vocabulary (the `TestStatusDot` component and the passing / failing / missing / not-run / skipped coverage computation) rather than a new status model. The detached top coverage strip is retained for the detailed per-status counts; the row indicator is the at-a-glance summary.

## Acceptance criteria

- Each spec artifact list row (per-domain) shows a single aggregate `TestStatusDot`
- The dot reflects the domain's rolled-up test status using the existing coverage computation
- Per-artifact coverage is visible in the list without opening the artifact
- The indicator reuses `TestStatusDot` / the existing coverage computation (no new status model)
- The existing top coverage strip is retained for detailed counts

**Tests:**
- `hub/client/src/screens/Specs.test.tsx::SPEC-scr-049 each specs-domain-row shows exactly one TestStatusDot` — "each domain sidebar row shows exactly one aggregate test status dot"
- `hub/client/src/screens/Specs.test.tsx::SPEC-scr-049 domain with all passing items shows a passing dot (green circle)` — "passing domain shows a passing dot"
- `hub/client/src/screens/Specs.test.tsx::SPEC-scr-049 domain with one failing item shows a failing dot` — "domain with failing items shows a failing dot"
- `hub/client/src/screens/Specs.test.tsx::SPEC-scr-049 domain with no test runs shows a not-run dot` — "domain with no test runs shows a not-run dot"
- `hub/client/src/screens/Specs.test.tsx::SPEC-scr-049 the existing coverage strip is still rendered alongside the sidebar dots` — "the top coverage strip is retained"

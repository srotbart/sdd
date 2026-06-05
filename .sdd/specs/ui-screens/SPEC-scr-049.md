---
id: SPEC-scr-049
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "d67c21c6"
---

# SPEC-scr-049 — Test indicators appear on each spec artifact list row

## Invariant

In the Specs screen, each spec artifact (per-domain) list row displays its test-status indicators, so per-artifact coverage is visible directly while scanning the spec list rather than only in the detached top coverage strip. The indicator reuses the existing test-status vocabulary — the `TestStatusDot` component and the passing / failing / missing / not-run / skipped coverage counts — rather than introducing a new status model.

## Acceptance criteria

- Each spec artifact list row (per-domain) shows test-status indicators
- The indicators reflect the artifact's aggregate test status using the existing vocabulary
- Per-artifact coverage is visible in the list without opening the artifact
- The indicator reuses `TestStatusDot` / the existing coverage computation (no new status model)

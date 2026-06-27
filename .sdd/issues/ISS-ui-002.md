---
id: ISS-ui-002
domain: ui-layout
status: open
location: ".sdd/specs/ui-layout/SPEC-ui-018.md"
severity: low
discovered: "2026-06-27T21:55:29Z"
reviewed-by: null
---

# Issue: Recently-added specs omit the Tests block although tests exist

**Location:** `.sdd/specs/ui-layout/SPEC-ui-018..023.md` (also `architecture/SPEC-arch-042,043`, `ui-components/SPEC-uic-014,015`, `ui-screens/SPEC-scr-052,053`)
**Problem:** Each of these specs has a dedicated `SPEC-id` describe block in the test suite (e.g. SPEC-ui-023 has 8 tests in `hub/client/src/spec-ui.test.tsx`, SPEC-uic-014 has 10) yet the spec file carries no `**Tests:**` block linking them, unlike every other active spec.
**Rationale:** The project convention links each invariant to its verifying tests; omitting the block leaves the spec inconsistent with the codebase and weakens the audit/test-status trail for newly-added behaviour.
**Severity:** low

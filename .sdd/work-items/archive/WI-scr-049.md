---
id: WI-scr-049
gap-id: GAP-scr-047
domain: ui-screens
status: done
created: "2026-06-05T01:30:00Z"
abandoned-reason: null
---

# Work Item: Specs screen sidebar — add aggregate TestStatusDot to each domain row

**Scope:** `hub/client/src/screens/Specs.tsx` — import `TestStatusDot`, derive the aggregate status from the existing `computeDomainCoverage` result for each domain, and render one `TestStatusDot` per `specs-domain-row` in the sidebar.

**Acceptance criteria:**
- Each `specs-domain-row` renders exactly one `.test-status-dot` element
- The dot status reflects the domain's rolled-up coverage: `failing` if any failing, else `missing` if any missing, else `passing` if all passing, else `not-run`
- The existing top coverage strip (`.specs-coverage-strip`) is still rendered
- The `TestStatusDot` component is reused, not a new implementation
- Unit test: domain with all passing items shows a passing dot in its sidebar row
- Unit test: domain with one failing item shows a failing dot in its sidebar row
- Unit test: domain with no test runs shows a not-run dot in its sidebar row
- Unit test: the existing coverage strip is still rendered alongside the dots

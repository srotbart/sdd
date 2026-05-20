---
id: GAP-scr-014
spec-item: SPEC-scr-012
domain: ui-screens
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: "5b024a9e"
closed-by: WI-scr-014
deferred-reason: null
---

# Gap: Active target rows have off-white background instead of #ffffff

**Location:** `hub/client/src/screens/Targets.css:116`

**Reasoning:** `.target-row` has no explicit background, so rows inherit `var(--paper-2)` (`#f7f7f5`) from the parent `.targets-list`; the spec requires active (non-archived) rows to have a white (`#ffffff`) background.

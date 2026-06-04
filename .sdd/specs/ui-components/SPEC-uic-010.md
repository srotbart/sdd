---
id: SPEC-uic-010
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "20d882a4"
---

# SPEC-uic-010 — ArtifactList filter tab derivation skips empty-string values

When deriving filter tabs from item field values, `ArtifactList` filters out any empty-string values before building the tab list. A tab with key `""` produces a button with no visible label (only a count number), which is confusing and unselectable in a meaningful way. Items whose `filterKey` field is an empty string are still rendered (they appear under the "all" tab) but do not generate their own dedicated filter tab.

**Tests:**
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-010 empty-string filter values skipped > SPEC-uic-010: an empty-string filterKey value produces no dedicated (label-less) filter tab` — every derived tab has a visible label; no blank tab is created for the empty-string value.
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-010 empty-string filter values skipped > SPEC-uic-010: items with an empty-string filter value still render under the "all" tab` — items with an empty filter value are still rendered under the all tab.

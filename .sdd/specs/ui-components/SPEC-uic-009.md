---
id: SPEC-uic-009
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "9e497ab2"
---

# SPEC-uic-009 — ArtifactList owns the filtering pipeline — derives tabs from items, applies filter internally

`ArtifactList` is redesigned to own the full filtering pipeline. New props: `filterKey?: keyof T` (field to group tabs by, e.g. `"status"`); `archivedValues?: string[]` (values of `filterKey` that count as archived); `filterLabels?: Record<string, string>` (optional display name overrides). When `filterKey` is provided, `ArtifactList` (1) derives filter tabs by collecting unique values of `items[filterKey]` plus a hard-coded "all" tab, (2) computes per-tab counts from the full `items` array, (3) maintains `activeFilter` state internally defaulting to `"all"`, (4) splits items into active (not in `archivedValues`) and archived (in `archivedValues`) after applying the active filter, (5) renders a filter bar above the list — tab buttons with label and muted mono count chip, accent treatment on the active tab, styles in `ArtifactList.css`. Callers pass a flat unfiltered `items` array and remove all inline filter state, active/archived split logic, and filter bar JSX. An optional `archivedKey?: keyof T` prop overrides the field used to classify archived rows: when provided, a row is archived if `String(item[archivedKey])` is in `archivedValues`; when absent, `filterKey` serves both as the tab grouping key and the archive classification key. This two-dimension pattern supports cases like Gaps.tsx where tabs group by `domain` but archiving is determined by `status`. When `filterKey` is absent, no filter bar renders and the existing `items`/`archivedItems` split API remains available for backwards compatibility.

**Tests:**
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-009 ArtifactList filtering pipeline > SPEC-uic-009: derives an "all" tab plus a tab per unique filterKey value with per-tab counts` — tab bar derives an all tab plus one tab per unique filter value, each with full-array counts.
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-009 ArtifactList filtering pipeline > SPEC-uic-009: defaults to "all" then filters internally when a tab is clicked` — defaults to all and narrows the rendered rows internally when a tab is selected.
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-009 ArtifactList filtering pipeline > SPEC-uic-009: archivedKey overrides filterKey for archive classification (two-dimension split)` — tabs group by one field while archive classification follows the separate archivedKey field.
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-009 ArtifactList filtering pipeline > SPEC-uic-009: renders no filter bar when filterKey is absent` — without filterKey the legacy split API renders no filter bar.

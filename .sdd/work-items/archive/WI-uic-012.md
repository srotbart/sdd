---
id: WI-uic-012
gap-id: GAP-uic-009
domain: ui-components
status: done
created: 2026-05-20T00:00:00Z
abandoned-reason: null
---

# Work Item: Extend ArtifactList with filterKey, archivedValues, filterLabels props and internal filter state

**Scope:** `hub/client/src/components/ArtifactList.tsx` — add optional `filterKey`, `archivedValues`, and `filterLabels` props; when `filterKey` is provided, derive filter tabs from item field values, compute per-tab counts, maintain `activeFilter` state internally, split items into active/archived after applying the filter, and render a filter bar above the list.

**Acceptance criteria:**
- `ArtifactListProps` includes `filterKey?: keyof T`, `archivedValues?: string[]`, `filterLabels?: Record<string, string>`
- When `filterKey` is provided, `ArtifactList` renders a filter bar with tabs derived from unique values of `items[filterKey]` plus "all"
- Per-tab counts are computed from the full `items` array
- `activeFilter` state is maintained internally, defaulting to `"all"`
- Active/archived split is applied after the active filter
- When `filterKey` is absent, existing `items`/`archivedItems` split API is preserved unchanged (backward compatible)
- CSS for the filter bar (tab buttons, active tab accent, count chip) is in `ArtifactList.css`
- TypeScript compiles without errors
- Client test: when `filterKey` is provided, clicking a tab hides items not matching that filter value
- Client test: when `filterKey` is absent, component renders without a filter bar

---
id: WI-uic-023
gap-id: GAP-uic-020
domain: ui-components
status: done
created: "2026-06-27T23:44:34Z"
abandoned-reason: null
---

# Work Item: Render work-item scope via the shared Markdown component

**Scope:** `hub/client/src/screens/WorkItems.tsx` — replace `renderScope` + `dangerouslySetInnerHTML` with the shared `Markdown` component for the work-item scope text.

**Acceptance criteria:**
- The `renderScope` helper and its `dangerouslySetInnerHTML` usage are removed
- Work-item scope renders through the shared `Markdown` component
- Inline code and paths in the scope still render (now via real markdown) without the custom regex
- Test: a work item whose scope contains an inline-code span renders a `<code>` element in the detail view

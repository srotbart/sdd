---
id: WI-uic-008
gap-id: GAP-uic-005
domain: ui-components
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Add 'archived' to StatusPill STATUS_MAP

**Scope:** `hub/client/src/components/StatusPill.tsx:9-22` — add `'archived': ['done', 'archived']` (or a suitable visual class) to `STATUS_MAP` so targets with `status: 'archived'` render a proper status pill instead of falling through to the draft default

**Acceptance criteria:**
- `STATUS_MAP` includes an entry for `'archived'`
- `<StatusPill status="archived" />` renders without falling back to `['draft', status]`
- The rendered pill label is `'archived'`
- Unit test: `<StatusPill status="archived" />` renders a pill with text "archived"
- Unit test: `<StatusPill status="archived" />` does not render the label as the literal string `'archived'` with the draft style class

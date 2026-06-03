---
id: WI-uic-009
gap-id: GAP-uic-006
domain: ui-components
status: done
created: 2026-05-20T00:00:00Z
abandoned-reason: null
---

# Work Item: Add 'deferred' and 'abandoned' entries to StatusPill STATUS_MAP

**Scope:** `hub/client/src/components/StatusPill.tsx:9` — add `'deferred'` and `'abandoned'` to the `STATUS_MAP` constant with canonical label and color class.

**Acceptance criteria:**
- `STATUS_MAP` contains an entry for `'deferred'` with a distinct label (e.g. `'deferred'`) and an appropriate color class
- `STATUS_MAP` contains an entry for `'abandoned'` with a distinct label (e.g. `'abandoned'`) and an appropriate color class
- No other component defines its own label/color mapping for these two status values
- TypeScript compiles without errors
- Client test: `StatusPill` renders a non-fallback label for `status="deferred"` (not the raw string passed through)
- Client test: `StatusPill` renders a non-fallback label for `status="abandoned"`

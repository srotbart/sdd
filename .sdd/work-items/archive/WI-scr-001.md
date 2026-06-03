---
id: WI-scr-001
gap-id: GAP-scr-001
domain: ui-screens
status: done
created: "2026-05-29T00:00:00Z"
abandoned-reason: null
---

# Work Item: Install fuse.js and create useSpecSearch hook

**Scope:** `hub/client/package.json` and `hub/client/src/screens/useSpecSearch.ts` — add `fuse.js` as a dependency and implement a `useSpecSearch(items, query)` hook that wraps Fuse with `threshold: 0.4`, keys `['id', 'title']`, and returns the filtered list (all items when query is empty).

**Acceptance criteria:**
- `fuse.js` appears in `package.json` `dependencies`
- `useSpecSearch.ts` exists and exports a `useSpecSearch` hook
- Hook returns all items unchanged when `query` is empty string
- Hook returns Fuse-filtered items when `query` is non-empty, using keys `id` and `title` with `threshold: 0.4`
- Unit test: empty query returns full item list
- Unit test: matching query returns subset; non-matching query returns empty array

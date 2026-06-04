---
id: GAP-ui-023
spec-item: SPEC-ui-020
domain: ui-layout
status: closed
discovered: "2026-06-04T00:00:00Z"
audit-spec-version: "6fd55da3"
closed-by: WI-ui-023
deferred-reason: null
---

# Gap: No pre-paint theme application in index.html or main.tsx

**Locations:**
- `hub/client/index.html:1`
- `hub/client/src/main.tsx:1`

**Reasoning:** `index.html` has no inline script to read the persisted theme preference and set the root attribute before React loads, and `main.tsx` does not apply the theme attribute before `createRoot(...).render()`; the first paint will always use the default light theme regardless of stored preference, causing a visible flash for dark-mode users.

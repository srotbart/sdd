---
id: WI-scr-044
gap-id: GAP-scr-042
spec-item: SPEC-scr-044
status: done
created: "2026-06-02T00:00:00Z"
abandoned-reason: null
---

**Scope:** `hub/client/src/screens/PluginReference.tsx` — delete the hardcoded `const SKILLS = [...]` array, add a `useEffect` that fetches `/plugin-skills` on mount, store the result in state, and render the fetched list; show a fallback message when the fetch fails or returns empty

**Acceptance criteria:**
- `const SKILLS = [...]` is removed from `PluginReference.tsx`
- A `useEffect` fetches `/plugin-skills` on mount and stores the result in component state
- Skills section renders the fetched `{ name, description }` objects
- A fallback message is shown when the fetch fails or the array is empty
- Test: `hub/client/src/screens/PluginReference.test.tsx` verifies that the component fetches `/plugin-skills` and renders the returned skill names

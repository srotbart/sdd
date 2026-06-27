---
id: WI-arch-042
gap-id: GAP-arch-045
domain: architecture
status: done
created: "2026-06-27T23:18:20Z"
abandoned-reason: null
---

# Work Item: Stop the watcher debounce from coalescing distinct event types

**Scope:** `hub/server/watcher.ts` — track pending report and non-report changes separately across the debounce window so both `onChange` and `onSpecsChanged` fire when both kinds occur.

**Acceptance criteria:**
- Within one debounce window, a report change and a regular `.sdd` change both result in their respective callback firing (neither is dropped)
- A regular change still fires `onChange` with the changed path; a report change still fires `onSpecsChanged`
- Debounce timing (150–300 ms) is unchanged
- Test: interleaved report + non-report events within the window invoke both `onChange` and `onSpecsChanged`

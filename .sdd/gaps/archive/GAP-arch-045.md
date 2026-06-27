---
id: GAP-arch-045
spec-item: SPEC-arch-004
domain: architecture
status: closed
discovered: "2026-06-27T23:18:20Z"
audit-spec-version: "9541d8ed"
closed-by: WI-arch-042
deferred-reason: null
---

# Gap: watcher debounce coalesces distinct event types into one callback

**Location:** `hub/server/watcher.ts:66`
**Reasoning:** `scheduleDebounced` shares one timer plus the last `filePath`/`isReport`, so a report change and a regular `.sdd` change within `DEBOUNCE_MS` fire only the last event's branch — the debounce drops either the `onSpecsChanged` or the `onChange` broadcast that SPEC-arch-004's debounced watching is meant to deliver.

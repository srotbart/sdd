---
id: ISS-arch-003
domain: architecture
status: open
location: "hub/server/watcher.ts:66"
severity: low
discovered: "2026-06-27T21:55:29Z"
reviewed-by: null
---

# Issue: Watcher debounce coalesces distinct event types into one callback

**Location:** `hub/server/watcher.ts:66`
**Problem:** `scheduleDebounced` shares a single `debounceTimer` plus the last `filePath`/`isReport`, so when a report (`.tests.json`) change and a regular `.sdd` change land within `DEBOUNCE_MS`, only the last event's branch fires.
**Rationale:** A spec-test report change immediately followed by another file change (or vice versa) drops either the `onSpecsChanged` or the `onChange` broadcast, so the UI's live test-status / artifact refresh silently misses an update.
**Severity:** low

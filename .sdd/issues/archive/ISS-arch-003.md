---
id: ISS-arch-003
domain: architecture
status: accepted
location: "hub/server/watcher.ts:66"
severity: low
discovered: "2026-06-27T21:55:29Z"
reviewed-by: GAP-arch-045
engaged-by: GAP-arch-045
---

# Issue: Watcher debounce coalesces distinct event types into one callback

**Location:** `hub/server/watcher.ts:66`
**Problem:** `scheduleDebounced` shares a single `debounceTimer` plus the last `filePath`/`isReport`, so when a report (`.tests.json`) change and a regular `.sdd` change land within `DEBOUNCE_MS`, only the last event's branch fires.
**Rationale:** A spec-test report change immediately followed by another file change (or vice versa) drops either the `onSpecsChanged` or the `onChange` broadcast, so the UI's live test-status / artifact refresh silently misses an update.
**Severity:** low

## Dialog

### 2026-06-27 — Agent
Recommendation: **accept as a gap** against SPEC-arch-004 (Filesystem watching uses chokidar,
debounced 150–300 ms). The debounce is correct in timing but coalesces distinct event types
into a single last-write-wins callback — a code divergence in the debounce logic. User
pre-authorised fixing this in PR 3. Outcome: GAP-arch-045 written; issue archived as accepted.

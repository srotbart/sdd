---
id: GAP-scr-045
spec-item: SPEC-scr-047
domain: ui-screens
status: closed
discovered: "2026-06-03T00:00:00Z"
audit-spec-version: "81174e03"
closed-by: WI-scr-045
deferred-reason: null
---

# Gap: No skipped state in parser, types, or UI — skipped items indistinct from not-run

**Locations:**
- `hub/server/sdd-parser.ts:506` — `TestStatus` type has no `skipped` status; `parseSpecItemFile` does not read a `**Tests:** skipped — <reason>` convention
- `hub/client/src/types.ts:91` — client `TestStatus` type has no `skipped` variant; `SpecItem` has no `skipped` or `skipReason` field
- `hub/client/src/components/TestStatusDot.tsx:3` — `TestStatusKind` enum has no `skipped` variant and `STATUS_COLORS` has no distinct color for skipped

**Reasoning:** SPEC-scr-047 requires deliberate skips to render distinctly from not-run with a visible reason, but the parser never parses the skip convention, the type system carries no skipped state, and TestStatusDot has no distinct indicator for skipped items.

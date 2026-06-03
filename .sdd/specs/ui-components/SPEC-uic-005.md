---
id: SPEC-uic-005
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "70203abd"
---

# SPEC-uic-005 — StatusPill is a shared component and single source of truth for status rendering

`hub/client/src/components/StatusPill.tsx` renders a semantic status label for any `ArtifactStatus` value. `STATUS_MAP` is the canonical mapping from status string to `{ label: string, color: string }` and covers all values in the `ArtifactStatus` union: `awaiting-user`, `awaiting-agent`, `ready`, `draft`, `accepted`, `open`, `pending`, `in-progress`, `blocked`, `done`, `closed`, `active`, `stale`. No other component may define its own status-to-color or status-to-label mapping for `ArtifactStatus` values; all artifact status rendering must go through `StatusPill`. This rule applies to the `ArtifactStatus` union only. Components that render a distinct non-artifact status domain with no overlap with `ArtifactStatus` (e.g. `TestStatusKind` in `TestStatusDot`) may define their own color mappings within their own component file.

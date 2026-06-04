---
id: SPEC-uic-005
domain: ui-components
abbrev: uic
status: active
aliases: []
version: "ceec4579"
---

# SPEC-uic-005 — StatusPill is a shared component and single source of truth for status rendering

`hub/client/src/components/StatusPill.tsx` renders a semantic status label for any `ArtifactStatus` value. `STATUS_MAP` is the canonical mapping from status string to `{ label: string, color: string }` and covers all values in the `ArtifactStatus` union: `awaiting-user`, `awaiting-agent`, `ready`, `draft`, `accepted`, `open`, `pending`, `in-progress`, `blocked`, `done`, `closed`, `active`, `stale`. No other component may define its own status-to-color or status-to-label mapping for `ArtifactStatus` values; all artifact status rendering must go through `StatusPill`. This rule applies to the `ArtifactStatus` union only. Components that render a distinct non-artifact status domain with no overlap with `ArtifactStatus` (e.g. `TestStatusKind` in `TestStatusDot`) may define their own color mappings within their own component file.

**Tests:**
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-005 StatusPill single source of truth > SPEC-uic-005: every ArtifactStatus in the spec list resolves to a semantic pill (not the raw fallback)` — every canonical ArtifactStatus value maps to a status-pill variant class with an LED and label.
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-005 StatusPill single source of truth > SPEC-uic-005: an honored label prop overrides the mapped text but keeps the mapped variant class` — explicit label overrides text while preserving the mapped variant class.
- `hub/client/src/spec-uic.test.tsx > SPEC-uic-005 StatusPill single source of truth > SPEC-uic-005: an unknown status falls back to the draft variant rather than inventing a class` — unmapped status degrades to the draft variant.

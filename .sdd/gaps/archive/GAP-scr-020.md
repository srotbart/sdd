---
id: GAP-scr-020
spec-item: SPEC-scr-014
domain: ui-screens
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "c0711a8c"
closed-by: WI-scr-020
deferred-reason: null
---

# Gap: Selected archived target row has no opacity:1 override

**Location:** `hub/client/src/components/ArtifactList.css:32`

**Reasoning:** `.artifact-list-archived-row` sets `opacity: 0.55` (and 0.85 on hover) with no rule that resets it to `1` when the wrapped row is selected/active, so a selected archived row remains dimmed instead of rendering at full opacity with `var(--paper-2)` background as the spec requires.

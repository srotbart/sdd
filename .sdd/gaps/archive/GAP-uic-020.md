---
id: GAP-uic-020
spec-item: SPEC-uic-013
domain: ui-components
status: closed
discovered: "2026-06-27T23:44:34Z"
audit-spec-version: "d31679a0"
closed-by: WI-uic-023
deferred-reason: null
---

# Gap: WorkItems renders scope via dangerouslySetInnerHTML, not the shared Markdown component

**Location:** `hub/client/src/screens/WorkItems.tsx:169` (used at `:202`)
**Reasoning:** `renderScope` builds HTML with ad-hoc regex replacements and injects it via `dangerouslySetInnerHTML` instead of using the shared `Markdown` component, diverging from SPEC-uic-013 (all markdown call sites use the shared component; raw HTML disabled).

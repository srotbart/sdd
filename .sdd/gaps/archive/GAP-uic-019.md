---
id: GAP-uic-019
spec-item: SPEC-uic-013
domain: ui-components
status: closed
discovered: "2026-06-27T23:44:34Z"
audit-spec-version: "d31679a0"
closed-by: WI-uic-022
deferred-reason: null
---

# Gap: Standards screen renders markdown without the shared Markdown component

**Location:** `hub/client/src/screens/Standards.tsx:86` (and the fallback at `:90`)
**Reasoning:** The standards screen renders `sec.body` and `file.content` as raw strings inside `<div>`s and never uses the shared `Markdown` component, diverging from SPEC-uic-013's invariant that every markdown-rendering surface uses the shared component.

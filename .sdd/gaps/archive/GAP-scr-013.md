---
id: GAP-scr-013
spec-item: SPEC-scr-010
domain: ui-screens
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: "5b024a9e"
closed-by: WI-scr-013
deferred-reason: null
---

# Gap: Archived divider missing trailing dot and flanking horizontal rule lines

**Locations:**
- `hub/client/src/screens/Targets.tsx:321`
- `hub/client/src/screens/Targets.css:495`

**Reasoning:** The divider renders `· ARCHIVED {N}` (no trailing `·`) and `.targets-archived-divider` has only a `border-bottom` — no flanking full-width `<hr>` elements on both sides as the spec's eyebrow-divider visual treatment requires.

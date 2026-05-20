---
id: GAP-scr-023
spec-item: SPEC-scr-025
status: closed
discovered: 2026-05-18T00:00:00Z
audit-spec-version: f1c1eaf6
closed-by: WI-scr-023
deferred-reason: null
---

**Location:** `hub/client/src/screens/Targets.tsx:326`

**Reasoning:** When any filter tab other than "all" is active, the list pane falls back to a plain `.map()` that bypasses `ArtifactList` entirely, re-implementing row rendering outside the shared component.

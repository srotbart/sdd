---
id: SPEC-scr-031
domain: ui-screens
abbrev: ui-screens
status: active
aliases: []
version: "a0f3aaf7"
---

# SPEC-scr-031 — Each artifact screen receives its initial selected item ID from the URL on mount

`App.tsx` passes the URL-parsed `selectedItemId` to each screen as the appropriate initial selection prop: `initialTargetId` to `<Targets>`, `initialGapId` to `<Gaps>`, `initialWiId` to `<WorkItems>`, and `initialSpecId` to `<Specs>`. On page refresh with `?v=gaps&id=GAP-arch-001` in the URL, the Gaps tab opens and GAP-arch-001 is pre-selected in the list pane, satisfying SPEC-scr-023.

**Tests:**
- `hub/client/src/App.test.tsx > URL param mount initialisation (WI-scr-018) > ?id=GAP-arch-001 with ?v=gaps causes Gaps to open with GAP-arch-001 pre-selected (WI-scr-028)` — "URL id= param causes the correct artifact to be pre-selected on mount"

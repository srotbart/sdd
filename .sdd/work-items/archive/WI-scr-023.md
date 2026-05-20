---
id: WI-scr-023
gap-id: GAP-scr-023
status: done
created: 2026-05-18T00:00:00Z
abandoned-reason: null
---

**Scope:** `hub/client/src/screens/Targets.tsx:312-334` — replace the plain `.map()` fallback for non-"all" filter tabs with `ArtifactList`, passing only the filtered active rows and an empty archivedItems array (since per-status filter tabs show a subset, not the full archive split).

**Acceptance criteria:**
- All filter tabs (awaiting-you, awaiting-agent, ready, draft, archived) render rows via `ArtifactList` — no bare `.map()` remains in the list pane
- The "all" tab continues to pass both active and archived items to `ArtifactList` as before
- No inline archived divider or opacity styling added to `Targets.tsx` or `Targets.css`
- Test: `Targets.test.tsx` verifies that switching to a non-"all" filter still renders rows wrapped in the `ArtifactList` DOM structure

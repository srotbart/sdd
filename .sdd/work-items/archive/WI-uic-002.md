---
id: WI-uic-002
gap-id: GAP-uic-001
domain: ui-components
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Refactor Targets.tsx to use ArtifactList

**Scope:** `hub/client/src/screens/Targets.tsx` + `hub/client/src/screens/Targets.css` — replace inline archived divider block (lines 321–345) with `<ArtifactList>`, move divider/opacity styles from `Targets.css` to `ArtifactList.css`

**Acceptance criteria:**
- `Targets.tsx` imports and renders `<ArtifactList>` instead of the inline divider + archived block
- `Targets.css` no longer contains `.targets-archived-divider*` or archived-row opacity rules (moved to `ArtifactList.css`)
- Visual output is identical to the pre-refactor state: same divider text, same caret toggle, same opacity on archived rows
- TypeScript: no type errors (`tsc --noEmit` passes)
- Existing `Targets.test.tsx` passes without modification (or is updated only to reflect import changes, not behaviour changes)

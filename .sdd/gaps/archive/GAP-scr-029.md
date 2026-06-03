---
id: GAP-scr-029
spec-item: SPEC-scr-032
domain: ui-screens
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "b97bcf38"
closed-by: WI-scr-029
deferred-reason: null
---

# Gap: TargetStatus union missing 'archived'; Targets.tsx uses 'accepted' as the archive filter

**Locations:**
- `hub/client/src/types.ts:16`
- `hub/client/src/screens/Targets.tsx:247-248`

**Reasoning:** `TargetStatus` does not include `'archived'`; `Targets.tsx` splits archived targets by `status === 'accepted'` instead of `status === 'archived'`, so targets returned from the archive directory (which now carry `status: 'archived'` per SPEC-arch-035) are not recognised as archived.

---
id: WI-scr-022
gap-id: GAP-scr-022
domain: ui-screens
status: done
created: "2026-05-18T00:00:00Z"
abandoned-reason: null
---

# Work Item: Include deferred and accepted gaps in Gaps screen archived section

**Scope:** `hub/client/src/screens/Gaps.tsx:27` — change `archivedGaps` filter from `status === 'closed'` to match all terminal statuses: `closed`, `deferred`, and `accepted`

**Acceptance criteria:**
- `archivedGaps` includes gaps with status `closed`, `deferred`, and `accepted`
- `activeGaps` excludes all three terminal statuses (previously only excluded `closed`)
- A gap with `status: deferred` appears in the archived section below the divider
- A gap with `status: accepted` appears in the archived section below the divider
- Unit test: given gaps with statuses `open`, `closed`, `deferred`, `accepted`, the active list contains only the `open` gap and the archived list contains the other three

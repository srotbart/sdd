---
id: GAP-scr-011
spec-item: SPEC-scr-012
status: closed
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: fac28ba6
closed-by: WI-scr-005
deferred-reason: null
---

# Targets active list rows have off-white background from container, not white

**Location:** `hub/client/src/screens/Targets.css:122`

**Reasoning:** `.target-row` sets `background: var(--paper)` which holds, but `.targets-list` sets `background: var(--paper-2)` — the container background bleeds through between rows and archived rows have no distinct muted treatment, meaning the overall list does not read as white active rows on a paper-2 background as the spec intends.

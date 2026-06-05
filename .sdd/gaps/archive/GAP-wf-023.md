---
id: GAP-wf-023
spec-item: SPEC-wf-025
domain: workflow
status: closed
discovered: "2026-06-05T00:00:00Z"
audit-spec-version: "57c8c116"
closed-by: WI-wf-022
deferred-reason: null
---

# Gap: Issues artifact type and reviewer skill do not exist

**Locations:**
- `plugin/skills/` — no issues reviewer skill (SKILL.md) exists
- `.sdd/issues/` — directory does not exist
- `.sdd/issues/archive/` — directory does not exist

**Reasoning:** No `ISS-{domain}-{seq}` artifact type, no `.sdd/issues/` storage, and no 3-agent TeamCreate reviewer skill exists as required by SPEC-wf-025.

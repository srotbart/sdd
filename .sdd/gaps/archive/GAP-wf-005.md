---
id: GAP-wf-005
spec-item: SPEC-wf-015
domain: workflow
status: closed
discovered: "2026-05-28T00:00:00Z"
audit-spec-version: "982d6354"
closed-by: WI-wf-005
deferred-reason: null
---

# Gap: session-start procedure says stale gaps are reported grouped by domain instead of per gap

**Location:** `plugin/skills/session-start/SKILL.md:45`

**Reasoning:** The procedure text says "Report stale gaps grouped by domain" but the spec requires each warning to name the specific gap ID and spec item ID — not the whole domain.

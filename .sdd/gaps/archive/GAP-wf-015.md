---
id: GAP-wf-015
spec-item: SPEC-wf-011
domain: workflow
status: closed
discovered: "2026-05-27T00:00:00Z"
audit-spec-version: "13386e51"
closed-by: WI-wf-015
deferred-reason: null
---

# Gap: Statusline right segment uses single {sdd_work} token instead of {pending}/{in-progress} format

**Location:** `plugin/skills/install-statusline/SKILL.md:43`

**Reasoning:** SPEC-wf-011 requires the work segment to render as `{pending}/{in-progress}` (two separate counts separated by a slash), but the install-statusline config template uses a single `{sdd_work}` token that does not expose the split between pending and in-progress counts.

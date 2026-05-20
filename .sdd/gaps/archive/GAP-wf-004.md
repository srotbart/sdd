---
id: GAP-wf-004
spec-item: SPEC-wf-003
domain: workflow
status: closed
discovered: "2026-05-18T00:00:00Z"
audit-spec-version: "968a43a5"
closed-by: WI-wf-004
deferred-reason: null
---

# Gap: session-start next-action footer has no case for a worker already running

**Location:** `plugin/skills/session-start/SKILL.md:73`

**Reasoning:** The next-action table shows `/sdd:spawn-sdd-worker` for execution conditions but has no row or logic for the case where a worker is already running, so the footer never suggests SendMessage to the existing worker as the spec requires.

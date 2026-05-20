---
id: WI-wf-004
gap-id: GAP-wf-004
domain: workflow
status: done
created: "2026-05-18T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add "worker already running" case to session-start next-action table

**Scope:** `plugin/skills/session-start/SKILL.md:73` — add a new row to the next-action footer table covering the case where an sdd-worker is already running, instructing the user to send the domain to the existing worker via SendMessage rather than spawn a new one

**Acceptance criteria:**
- The next-action table includes a row for "Worker already running" that suggests `SendMessage to "sdd-worker" with the domain` instead of `/sdd:spawn-sdd-worker`
- The new row is placed above the execution-condition rows so it takes precedence when a worker is active
- The procedure section describes how to detect whether a worker is already running (e.g., check if a named agent "sdd-worker" is present in the session)
- Skill text test: the SKILL.md body contains the string "SendMessage" in the next-action section

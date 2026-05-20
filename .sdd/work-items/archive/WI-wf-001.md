---
id: WI-wf-001
gap-id: GAP-wf-001
domain: workflow
status: done
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Create sdd:spawn-sdd-worker skill

**Scope:** `plugin/skills/spawn-sdd-worker/SKILL.md` — create the skill file with instructions for spawning a persistent agent named `sdd-worker` that runs the full execution pipeline (spec-audit → gap-to-work-items → work-item-close loop) for a specified domain argument.

**Acceptance criteria:**
- `plugin/skills/spawn-sdd-worker/SKILL.md` exists
- Skill instructs the agent to use the Agent tool to spawn a named agent called `sdd-worker`
- The spawned agent's prompt includes: read the domain argument, run `sdd:spec-audit {domain}`, then `sdd:gap-to-work-items {domain}`, then call `sdd:work-item-close` for each open work item until none remain
- The skill notes the worker is persistent and can receive additional domain names via SendMessage
- Verification: file exists and grep confirms "sdd-worker" and "Agent tool" are referenced in the skill content

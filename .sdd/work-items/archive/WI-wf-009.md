---
id: WI-wf-009
gap-id: GAP-wf-007
domain: workflow
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Add conditional next-step footer to work-item-close skill

**Scope:** `plugin/skills/work-item-close/SKILL.md:103` — replace the unconditional "Run `/sdd:session-start`" footer with a conditional: if more work items remain for the domain, suggest "Run `/sdd:work-item-close WI-{next-id}`"; if all work items are closed, suggest "Run `/sdd:spec-audit {domain}` to verify"

**Acceptance criteria:**
- Footer is conditional on remaining work: items remain → next WI close command; all closed → spec-audit verify
- The exact next WI ID or domain is substituted in the command
- The footer is separated from the summary by a `---` divider
- Verification: reading the skill file confirms both conditional branches are present

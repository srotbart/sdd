---
id: WI-wf-008
gap-id: GAP-wf-007
domain: workflow
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Add conditional next-step footer to spec-audit skill

**Scope:** `plugin/skills/spec-audit/SKILL.md:136` — replace the unconditional "Run `/sdd:gap-to-work-items`" footer with a conditional: if gaps were found, suggest "Run `/sdd:gap-to-work-items {domain}`"; if no gaps were found, suggest "Run `/sdd:spec-test {domain}`"

**Acceptance criteria:**
- Footer is conditional on audit outcome: gaps found → gap-to-work-items; none found → spec-test
- The exact domain argument is substituted in the command
- The footer is separated from the summary by a `---` divider
- Verification: reading the skill file confirms both conditional branches are present

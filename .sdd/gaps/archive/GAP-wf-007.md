---
id: GAP-wf-007
spec-item: SPEC-wf-008
domain: workflow
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "b56c0b34"
closed-by: WI-wf-009
deferred-reason: null
---

# Gap: spec-audit and work-item-close footers are unconditional — no conditional next-step suggestion

**Locations:**
- `plugin/skills/spec-audit/SKILL.md:136`
- `plugin/skills/work-item-close/SKILL.md:103`

**Reasoning:** `spec-audit` always suggests "Run `/sdd:gap-to-work-items`" regardless of whether gaps were found (should say "Run `/sdd:spec-test {domain}`" when none found); `work-item-close` always says "Run `/sdd:session-start`" regardless of whether more work items remain (should suggest the next WI ID when items remain, or "Run `/sdd:spec-audit {domain}` to verify" when all closed), violating SPEC-wf-008.

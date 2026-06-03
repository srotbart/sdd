---
id: WI-wf-013
gap-id: GAP-wf-013
domain: workflow
status: done
created: "2026-05-21T00:00:00Z"
abandoned-reason: null
---

# Work Item: Add next-step footer to target-engage SKILL.md for accepted outcomes

**Scope:** `plugin/skills/target-engage/SKILL.md:99-129` — append a `---` divider followed by `"Run \`/sdd:spec-audit {domain}\` to audit the updated spec."` to the Report instruction in each accepting outcome (No-op, Extension, New domain)

**Acceptance criteria:**
- No-op outcome Report block ends with `---` and "Run `/sdd:spec-audit {domain}` to audit the updated spec."
- Extension outcome Report block ends with `---` and "Run `/sdd:spec-audit {domain}` to audit the updated spec."
- New domain outcome Report block ends with `---` and "Run `/sdd:spec-audit {domain}` to audit the updated spec."
- Conflict and Ambiguous outcomes are not modified (they do not accept the target, so no spec-audit footer applies)
- Manual review confirms the footer text matches the SPEC-wf-008 prescribed form for target-engage

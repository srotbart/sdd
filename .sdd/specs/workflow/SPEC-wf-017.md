---
id: SPEC-wf-017
domain: workflow
abbrev: wf
status: active
aliases: []
version: "3b75790b"
---

# SPEC-wf-017 — Spec item files require Invariant and Acceptance Criteria sections

Each spec item file body must contain three structured sections in order: (1) `# {id} — {title}` heading, (2) `## Invariant` — a concise statement of the rule or behavior the item asserts, (3) `## Acceptance criteria` — a plain bullet list of verifiable conditions that must hold for the invariant to be satisfied. The optional `**Tests:**` block, when present, follows `## Acceptance criteria`. Skills that write spec items (`sdd:target-engage`, `sdd:gap-to-work-items`, `sdd:work-item-close`, `sdd:spec-audit`) must produce this structure for every spec item they create or update. The Hub API spec parser must extract and expose both sections. `references/schemas.md` must document the required sections.

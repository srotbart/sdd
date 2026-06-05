---
id: SPEC-wf-028
domain: workflow
abbrev: wf
status: active
aliases: []
version: "2f1cabfc"
---

# SPEC-wf-028 — Coding standards are user-authored and live outside the spec

## Invariant

Repositories using SDD have **user-authored coding standards** covering formatting/style, best practices and anti-patterns, project-specific conventions, and architectural rules. The user is the source of truth; the agent does not invent or infer them. Coding standards are **not** spec items and are **not** swept by `/sdd:spec-audit` — the spec and spec-audit remain focused on behavior (what must be true). The standards have two homes that stay consistent: `CLAUDE.md` (so they reach Claude's context proactively) and a structured `.sdd/standards/` artifact (the rubric the reviewer uses). Standards are the clean conventions and patterns code is refactored into, belonging to the review/refactor phase — SDD as TDD-for-agents: spec (red) → code (green) → review → gaps → refactor.

## Acceptance criteria

- Coding standards are authored by the user, not invented or inferred by the agent
- Standards cover formatting/style, best-practices/anti-patterns, project-specific conventions, and architecture
- Standards are not represented as spec items and are not evaluated by `/sdd:spec-audit`
- Standards are present both in `CLAUDE.md` (proactive delivery) and a structured `.sdd/standards/` artifact (reviewer rubric), kept consistent
- Standards apply in any repository containing a `.sdd/` directory

**Tests:**
- `.sdd/standards/standards-template.md` exists — "standards rubric template is scaffolded in .sdd/standards/"
- `CLAUDE.md` contains "Coding Standards" — "CLAUDE.md has a standards section for proactive delivery"

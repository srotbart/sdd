---
id: SPEC-wf-026
domain: workflow
abbrev: wf
status: active
aliases: []
version: "c1f65d7d"
---

# SPEC-wf-026 — Coding standards are user-authored and live outside the spec

## Invariant

Repositories using SDD have **user-authored coding standards** covering formatting/style, best practices and anti-patterns, project-specific conventions, and architectural rules. The user is the source of truth; the agent does not invent or infer them. Coding standards are **not** spec items and are **not** swept by `/sdd:spec-audit` — the spec and spec-audit remain focused on behavior (what must be true). Standards are the clean conventions and patterns code is refactored into, belonging to the review/refactor phase rather than the spec phase. This reflects SDD as TDD-for-agents: spec (red) → code (green) → review → gaps → refactor.

## Acceptance criteria

- Coding standards are authored by the user, not invented or inferred by the agent
- Standards cover formatting/style, best-practices/anti-patterns, project-specific conventions, and architecture
- Standards are not represented as spec items and are not evaluated by `/sdd:spec-audit`
- The spec and `/sdd:spec-audit` remain focused on behavioral requirements
- Standards apply in any repository containing a `.sdd/` directory

---
id: SPEC-wf-028
domain: workflow
abbrev: wf
status: active
aliases: []
version: "4940b8b4"
---

# SPEC-wf-028 — Coding standards are user-authored and live outside the spec

## Invariant

Repositories using SDD have **user-authored coding standards** covering formatting/style, best practices and anti-patterns, project-specific conventions, and architectural rules. The user is the source of truth; the agent does not invent or infer them. Coding standards are **not** spec items and are **not** swept by `/sdd:spec-audit` — the spec and spec-audit remain focused on behavior (what must be true). The structured `.sdd/standards/` artifact is the **single authoritative home** for the rubric. The agent receives it proactively at session open — `sdd:session-start` surfaces it into the agent's context (SPEC-wf-029, layer 1) — rather than the rules being duplicated into `CLAUDE.md`; `CLAUDE.md` may keep a brief pointer to `.sdd/standards/` so a reader knows where the rubric lives, but it does not carry the rule content, which avoids drift between two copies. Standards are the clean conventions and patterns code is refactored into, belonging to the review/refactor phase — SDD as TDD-for-agents: spec (red) → code (green) → review → gaps → refactor.

## Acceptance criteria

- Coding standards are authored by the user, not invented or inferred by the agent
- Standards cover formatting/style, best-practices/anti-patterns, project-specific conventions, and architecture
- Standards are not represented as spec items and are not evaluated by `/sdd:spec-audit`
- The `.sdd/standards/` artifact is the single authoritative rubric; `CLAUDE.md` does not duplicate the rule content (a brief pointer to `.sdd/standards/` is allowed)
- Standards reach the agent's context proactively via `sdd:session-start`, not via a `CLAUDE.md` copy
- Standards apply in any repository containing a `.sdd/` directory

**Tests:**
- `.sdd/standards/standards-template.md` exists — "standards rubric template is scaffolded in .sdd/standards/"
- `CLAUDE.md` contains "Coding Standards" — "CLAUDE.md keeps a pointer section to the .sdd/standards/ rubric (no rule duplication)"
- `plugin/skills/session-start/SKILL.md` references ".sdd/standards/" — "session-start surfaces the standards rubric for proactive delivery"

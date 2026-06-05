---
id: SPEC-wf-029
domain: workflow
abbrev: wf
status: active
aliases: []
version: "8f94f871"
---

# SPEC-wf-029 — Coding standards are enforced across three layers, not by spec-audit

## Invariant

User-authored coding standards (SPEC-wf-028) are enforced through three complementary layers, none of which is `/sdd:spec-audit`: (1) **proactive** — the standards in `CLAUDE.md` reach Claude's working context so it follows them as it writes; (2) **active blocking** — linters/formatters plus a hook or CI gate reject code that violates the mechanically-checkable rules; (3) **review-time** — the issues reviewer team (SPEC-wf-025) audits code against the `.sdd/standards/` rubric for the judgement-based rules linters cannot express, and the resulting issues flow into refactor work items. Mechanically-checkable rules are routed to the lint/blocking layer; judgement-based rules (anti-patterns, architectural rules) are routed to the reviewer.

## Acceptance criteria

- Standards in `CLAUDE.md` are delivered into Claude's working context so they are followed during authoring
- A lint/format step plus a hook or CI gate blocks code that violates mechanically-checkable rules
- The issues reviewer team (SPEC-wf-025) audits code against the `.sdd/standards/` rubric for judgement-based rules
- Standards violations surfaced at review become issues that flow into refactor work items
- `/sdd:spec-audit` is not used as a coding-standards enforcement mechanism

**Tests:**
- `bash plugin/scripts/lint-check.sh` exits 0 in a clean state — "lint-check.sh runs and passes in a clean repo"
- `plugin/scripts/lint-check.sh` does not reference "spec-audit" — "lint-check does not invoke spec-audit for standards enforcement"

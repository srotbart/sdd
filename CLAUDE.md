# Claude Code Instructions

This file delivers project-specific instructions to Claude during every session.

---

## Coding Standards

This project uses SDD (Spec-Driven Development). Coding standards are user-authored
and live in `.sdd/standards/standards-template.md`. They are **not** spec items and
are **not** evaluated by `/sdd:spec-audit`.

**During authoring:** Follow the standards in `.sdd/standards/standards-template.md`
as you write or modify code. These are the clean conventions and patterns code is
refactored into.

**Standards cover:** formatting/style, best-practices/anti-patterns, project-specific
conventions, and architectural rules. Read `.sdd/standards/standards-template.md` for
the current rules before writing code.

**Enforcement layers:**
1. **Proactive** — you read and follow these standards as you write (this file)
2. **Active blocking** — `plugin/scripts/lint-check.sh` can be wired as a pre-commit
   hook or CI step to catch mechanically-checkable violations
3. **Review-time** — `/sdd:review-issues` uses `.sdd/standards/` as the rubric for
   judgement-based rules

---

## SDD Workflow

This project uses the SDD pipeline. Always start a session with `/sdd:session-start`
to get the current state before working.

**Quick reference:**
- `.sdd/targets/` — user intent (negotiated in-document)
- `.sdd/specs/` — canonical invariants (source of truth)
- `.sdd/gaps/` — codebase divergences from spec
- `.sdd/work-items/` — scoped tasks to close gaps
- `.sdd/issues/` — reviewer-flagged problems
- `.sdd/improvements/` — reviewer-proposed enhancements

**Skills:** `/sdd:session-start` → `/sdd:target-engage` → `/sdd:spec-audit` →
`/sdd:gap-to-work-items` → `/sdd:work-item-close`

---

## Notes

_[Add any other project-specific instructions for Claude here]_

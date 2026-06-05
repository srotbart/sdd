# Coding Standards

<!-- 
INSTRUCTIONS FOR THE USER:
  Fill in each section below with your project's actual coding standards.
  This file is the reviewer rubric used by `/sdd:review-issues` and
  `/sdd:review-improvements` for judgement-based rules that linters cannot express.

  Keep CLAUDE.md in sync — add the same standards there so Claude follows them
  during authoring (proactive enforcement).

  IMPORTANT: These are NOT spec items. Do not add SPEC-* references here.
  Standards belong to the review/refactor phase, not to spec-audit.
-->

---

## Formatting and Style

<!-- 
  Rules for code formatting, indentation, line length, file structure.
  Example:
  - 2-space indentation; no tabs
  - Max line length: 100 characters
  - One blank line between functions; two between top-level declarations
  - Import order: stdlib → third-party → local
-->

_[Fill in your formatting and style rules]_

---

## Best Practices and Anti-Patterns

<!--
  Patterns to follow and patterns to avoid.
  Example:
  - Prefer explicit error handling over silent catches (no `catch {}` without log)
  - Avoid mutation of function parameters
  - Anti-pattern: using `any` type in TypeScript without a comment explaining why
  - Prefer early return over deeply nested conditionals
-->

_[Fill in best practices and anti-patterns for this project]_

---

## Project-Specific Conventions

<!--
  Naming conventions, file organisation, domain-specific rules.
  Example:
  - Component files: PascalCase.tsx; util files: camelCase.ts
  - All async functions prefixed with "fetch" or "load" when they make network calls
  - Domain objects: immutable value types; service objects: class instances
-->

_[Fill in project-specific conventions]_

---

## Architectural Rules

<!--
  High-level structural rules: which layers may import which, where state lives,
  how side effects are isolated, etc.
  Example:
  - UI components must not import directly from database layer
  - All side effects (network, file I/O) must be in service classes
  - No business logic in route handlers — delegate to domain services
-->

_[Fill in architectural rules]_

---

## Reviewer Notes

<!--
  Notes for the review-issues and review-improvements skills about how to apply
  these standards. Add exceptions, priority guidance, or context here.
  Example:
  - Legacy files under src/legacy/ are exempt from line-length rules
  - Architectural violations are always high-severity issues
  - Style violations are always low-severity unless they affect readability
-->

_[Fill in reviewer guidance]_

# Coding Standards

<!--
  Reviewer rubric used by /sdd:review-issues and /sdd:review-improvements for
  judgement-based rules linters cannot express. These are NOT spec items — they
  belong to the review/refactor phase, not spec-audit. Keep CLAUDE.md in sync so
  Claude follows them while authoring (proactive enforcement).
-->

---

## Formatting and Style

- 2-space indentation; no tabs.
- TypeScript runs in `strict` mode; `noUnusedLocals` and `noUnusedParameters` are on —
  no unused imports, locals, or parameters.
- Import order: Node/stdlib → third-party → local. Server (ESM) local imports use
  explicit `.js` extensions.
- Prefer `const`; use `let` only when reassigned. No `var`.
- One concern per file; keep modules focused.

---

## Best Practices and Anti-Patterns

- **No `dangerouslySetInnerHTML`.** Render markdown through the shared `Markdown`
  component; raw HTML stays disabled. _(ISS-scr-003)_
- **Don't repeat a non-trivial code shape across 3+ sites.** Extract a shared helper or
  component instead of copy-pasting. Two copies is a smell to watch; three is a refactor.
  _(ISS-arch-004, ISS-arch-006, ISS-arch-007, ISS-ui-001, ISS-scr-002)_
- Prefer explicit error handling. No silent `catch {}` without a comment explaining intent.
- Avoid `any` without a short comment justifying it.
- Prefer early return over deeply nested conditionals.
- Validate/​sanitise externally-supplied input (paths, query params) before use.

---

## Project-Specific Conventions

- Component files: `PascalCase.tsx` under `components/`; screens under `screens/`;
  utility modules: `camelCase.ts`. Co-locate `*.test.tsx`/`*.test.ts` with the unit.
- **Reuse the shared components** rather than re-implementing their concern:
  `Markdown`, `StatusPill`, `ArtifactList`, `ArtifactIdLink`, `ArchiveFooter`,
  `TestStatusDot`. A new screen that renders a list/markdown/status should compose these.
  _(ISS-scr-001, ISS-scr-003, ISS-scr-004)_
- Two screens that are structural clones (e.g. Issues/Improvements) should share a
  parametrised component, not be maintained in lockstep by hand. _(ISS-scr-001)_
- Each spec item links its verifying tests via a `**Tests:**` block; a spec with backing
  tests should not omit it. _(ISS-ui-002, ISS-wf-001)_
- ID sequences (gaps, work items, issues) are globally unique within a domain and must be
  numbered from both active and `archive/` — never recycled. _(ISS-wf-002)_

---

## Architectural Rules

- **Thin route handlers.** No god-functions: a request dispatcher should not be a giant
  if-chain with copy-pasted guard clauses. Extract per-route handlers and shared guards
  (e.g. workspace-lookup + 404). _(ISS-arch-005)_
- **One source per repeated mechanism.** Directory-walk/parse scaffolds, watcher-callback
  wiring, and per-artifact client fetch effects should each be defined once and
  parametrised, not duplicated per artifact type. _(ISS-arch-004, ISS-arch-006, ISS-ui-001)_
- A display/derivation rule used on both server and client (e.g. domain-abbrev) has one
  definition, not two that can drift. _(ISS-arch-007)_
- Side effects (file I/O, network, process spawning) are guarded so a single failure
  cannot crash the process. _(ISS-arch-001)_

---

## Reviewer Notes

- Architectural-rule violations: **high** severity. Correctness/security: **high**.
- Duplication across 3+ sites or a clear anti-pattern: **medium**.
- Style nits and naming suggestions: **low** unless they impair readability.
- These standards are the refactor rubric; they are enforced at review time and as
  proactive guidance, never via `/sdd:spec-audit`.

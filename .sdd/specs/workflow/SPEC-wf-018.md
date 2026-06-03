---
id: SPEC-wf-018
domain: workflow
abbrev: wf
status: active
aliases: []
version: "28f1f6b7"
---

# SPEC-wf-018 — Spec item files may be grouped under an optional subject subdirectory within a domain

## Invariant

Spec items may live at `.sdd/specs/{domain}/{subject}/SPEC-{abbrev}-{seq}.md` where `{subject}` is a camelCase name derived from the related component or concept (e.g. `artifactList`, `commandPalette`). Items without a subject remain at the domain root: `.sdd/specs/{domain}/SPEC-{abbrev}-{seq}.md`. The archive sibling lives adjacent to the spec file: `.sdd/specs/{domain}/{subject}/archive/` for subject-grouped items, `.sdd/specs/{domain}/archive/` for root-level items. Subject is a filesystem-only organisational concern — spec item IDs and frontmatter fields are unchanged. All SDD skills and tools that enumerate spec files must glob both `{domain}/SPEC-*.md` and `{domain}/*/SPEC-*.md`, excluding any `archive/` directories at either level. The Hub API spec parser and `sdd:session-start` stale-audit detection must resolve spec item files at both path depths.

## Acceptance criteria

- Spec items at `{domain}/{subject}/SPEC-*.md` are enumerated by all SDD skills alongside domain-root items
- `archive/` subdirectories at both `{domain}/archive/` and `{domain}/{subject}/archive/` are excluded from enumeration
- Spec item `id`, `domain`, `abbrev`, and `status` frontmatter fields are unchanged by subject grouping
- Hub API `parseSpecs()` returns items from both domain-root and subject-subdirectory paths
- `sdd:session-start` stale-audit detection resolves spec item files at both path depths

**Tests:**
- `hub/server/sdd-parse-specs.test.ts::SPEC-wf-018: subject subdirectory glob > includes spec items found in a subject subdirectory` — "parseSpecs returns items from both domain-root and one-level subject subdirectory"
- `hub/server/sdd-parse-specs.test.ts::SPEC-wf-018: subject subdirectory glob > excludes spec items inside an archive subdirectory at domain root level` — "parseSpecs excludes items under domain-root archive/ directory"
- `hub/server/sdd-parse-specs.test.ts::SPEC-wf-018: subject subdirectory glob > excludes spec items inside an archive subdirectory nested under a subject` — "parseSpecs excludes items under subject/archive/ nested directory"

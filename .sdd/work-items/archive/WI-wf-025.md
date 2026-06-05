---
id: WI-wf-025
gap-id: GAP-wf-026
domain: workflow
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Scaffold .sdd/standards/ and CLAUDE.md standards section

**Scope:** `.sdd/standards/` (new), `CLAUDE.md` (new or update) — create standards directory with user-fillable template; create/update CLAUDE.md with standards placeholder section

**Acceptance criteria:**
- `.sdd/standards/` directory exists with a `standards-template.md` user-fillable template
- Template covers sections: formatting/style, best-practices/anti-patterns, project conventions, architecture
- `CLAUDE.md` exists at project root with a `## Coding Standards` section pointing to `.sdd/standards/`
- CLAUDE.md instructs agent to follow standards during authoring
- Standards are not represented as spec items (no SPEC-* references in template)
- Test: `ls .sdd/standards/standards-template.md` exits 0
- Test: grep `CLAUDE.md` for "Coding Standards" → found

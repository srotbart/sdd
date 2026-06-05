---
id: WI-wf-024
gap-id: GAP-wf-025
domain: workflow
status: done
created: "2026-06-05T00:00:00Z"
abandoned-reason: null
---

# Work Item: Create issue/improvement engage skill

**Scope:** `plugin/skills/issue-engage/` (new) — create SKILL.md for interactively engaging issues and improvements in-document, routing outcomes to spec changes or gaps

**Acceptance criteria:**
- `plugin/skills/issue-engage/SKILL.md` exists
- SKILL.md handles both `ISS-*` and `IMP-*` artifact types
- SKILL.md specifies in-document dialog (append-only, mirrors target-engage pattern)
- SKILL.md specifies two terminal outcomes: accepted (creates spec change or gap) or dismissed (archive with provenance)
- SKILL.md requires human sign-off (never auto-applied)
- SKILL.md specifies archiving dismissed artifacts with provenance back to origin
- Test: grep `plugin/skills/issue-engage/SKILL.md` for "dismissed" → found
- Test: grep `plugin/skills/issue-engage/SKILL.md` for "accepted" → found

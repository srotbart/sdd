---
id: SPEC-wf-027
domain: workflow
abbrev: wf
status: active
aliases: []
version: "4f211211"
---

# SPEC-wf-027 — Issues and improvements are engaged like targets and resolve into a spec change or a gap

## Invariant

Issue and improvement artifacts are not acted on automatically. They are followed up by the user together with the main Claude session, mirroring the target engage flow: the user and the session **engage** an artifact in-document (discuss / refine / accept / dismiss), and the outcome **mutates or creates a spec item or a gap** — a genuine divergence from intended behavior becomes a gap, a missing or incorrect requirement becomes a spec change, and non-actionable items are dismissed and archived with provenance. This engagement is an intent-phase activity (human + Claude) and is never delegated to an automated agent, consistent with SPEC-wf-001.

## Acceptance criteria

- Issues and improvements are followed up interactively by the user + the main session, never auto-applied
- Engaging an artifact appends an in-document dialog and reaches a terminal decision (accepted or dismissed)
- An accepted artifact results in either a new/edited spec item or a new gap
- Dismissed artifacts are archived with provenance back to their origin
- The engage step is intent-phase (requires human sign-off), consistent with SPEC-wf-001

**Tests:**
- `plugin/skills/issue-engage/SKILL.md` contains "dismissed" — "issue-engage skill handles dismissed terminal decision with provenance"
- `plugin/skills/issue-engage/SKILL.md` contains "accepted" — "issue-engage skill handles accepted terminal decision routing to spec change or gap"

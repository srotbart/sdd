---
id: WI-wf-90e70a0
gap-id: GAP-wf-4079c34
domain: workflow
status: done
created: "2026-07-03T02:31:16Z"
abandoned-reason: null
---

# Work Item: Archiving skills commit terminal state before mv and stop staging archive paths

**Scope:** `plugin/skills/work-item-close/SKILL.md`, `plugin/skills/target-engage/SKILL.md`, `plugin/skills/review-engage/SKILL.md`, and `plugin/references/artifacts/*.md` — make each archiving flow state the ordering write terminal state → commit → `mv` into `archive/`, forbid staging/committing files under ephemeral `archive/` paths, and document the merge-commit-only (no squash/rebase) caveat in the operating guides.

**Acceptance criteria:**
- work-item-close, target-engage, and review-engage each explicitly instruct: write terminal state → commit → `mv` to `archive/`
- No archiving skill instructs staging or committing files under ephemeral `archive/` paths
- The merge-strategy caveat (merge commits, no squash/rebase-away) is documented in the artifact operating guides
- Test (hub `spec-wf-plugin.test.ts`): assert each of the three archiving skills states the commit-before-`mv` ordering and does not stage archive paths

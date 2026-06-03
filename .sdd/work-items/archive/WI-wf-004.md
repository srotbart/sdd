---
id: WI-wf-004
gap-id: GAP-wf-004
domain: workflow
status: done
created: "2026-05-28T00:00:00Z"
abandoned-reason: null
---

# Work Item: Fix install-statusline fallback spec count to glob domain subdirectories

**Scope:** `plugin/skills/install-statusline/SKILL.md:78` — replace `ls .sdd/specs/SPEC-*.md` with a glob that counts spec items across all domain subdirectories

**Acceptance criteria:**
- The fallback command counts `.md` files in `.sdd/specs/*/` subdirectories (excluding `archive/`)
- The corrected command returns the actual spec item count when the Hub API is unreachable
- Manual review: test the corrected command against the actual `.sdd/specs/` directory and confirm it returns a non-zero count

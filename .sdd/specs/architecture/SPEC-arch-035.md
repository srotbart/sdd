---
id: SPEC-arch-035
domain: architecture
abbrev: arch
status: active
aliases: []
version: "508a79cc"
---

# SPEC-arch-035 — parseTargets sets status 'archived' for targets read from the archive directory

`parseTargets` reads from both `.sdd/targets/` (active) and `.sdd/targets/archive/` (archived). Targets read from the archive directory are returned with `status: 'archived'` regardless of the status value in their frontmatter. This allows the client to distinguish archived targets from active ones using a single `status` field, enabling the Targets screen filter tab and the sidenav count exclusion (SPEC-scr-018) to work without directory path inspection.

**Tests:**
hub/server/spec-arch.test.ts > SPEC-arch-035: parseTargets archived status > SPEC-arch-035: a target read from targets/archive/ is returned with status 'archived' regardless of frontmatter — "archive-directory targets are returned with status archived"
hub/server/spec-arch.test.ts > SPEC-arch-035: parseTargets archived status > SPEC-arch-035: an active-dir target keeps its frontmatter status — "active-directory targets keep their frontmatter status"

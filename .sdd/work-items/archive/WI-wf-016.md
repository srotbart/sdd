---
id: WI-wf-016
gap-id: GAP-wf-016
status: done
created: "2026-06-01T00:00:00Z"
abandoned-reason: null
---

# Add design scanning and "Designs in progress" section to session-start

**Scope:** `plugin/skills/session-start/SKILL.md` — extend the "Collect active artifacts" step to scan `.sdd/design/*/design.md`, and add a "Designs in progress" section to the output format that lists designs with no corresponding targets

**Acceptance criteria:**
- "Collect active artifacts" step reads `.sdd/design/*/design.md` files (extracting the design name from the directory)
- Output includes a "Designs in progress" section listing designs that have no target with a matching `design:` frontmatter field
- Section is omitted entirely when no such designs exist
- Each entry shows the design name and directory path
- Test: session-start output contains "Designs in progress" when `.sdd/design/foo/design.md` exists and no target references `design: foo`
- Test: section is absent when all designs have a corresponding target

---
id: WI-wf-011
gap-id: [GAP-wf-009, GAP-wf-010, GAP-wf-011]
domain: workflow
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---

# Work Item: Implement statusline left segment, right segment, and SDD count fetching in install-statusline skill

**Scope:** `plugin/skills/install-statusline/SKILL.md` — add to the skill's procedure: (1) left segment config: `→ {dir} | git:({branch}) {dirty} | [{context-bar}] {context-pct}%` with exact hex colors per SPEC-wf-010; (2) right segment config: `specs: {n} | targets: {awaiting} | gaps: {open} | work: {pending}/{in-progress}` with conditional coloring per SPEC-wf-011; (3) count-fetching: try Hub API endpoints first, fall back to .sdd/ file counting per SPEC-wf-012; all three as the `statusline` key merged into `.claude/settings.json`

**Acceptance criteria:**
- Left segment includes all tokens with correct hex color values (#5fffaf, #5fd7ff, #ffd700, #ff87ff, #ff5f5f, #808080)
- Right segment conditional coloring: targets yellow when >0, gaps red when >0, work cyan when >0
- Count-fetching first attempts Hub API (`localhost:22351/workspaces/{id}/targets` etc.), falls back to .sdd/ file counting
- SDD right segment is omitted entirely when neither Hub nor .sdd/ is found
- Verification: skill file contains the exact hex color strings and Hub API endpoint patterns

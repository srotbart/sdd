---
id: WI-ui-024
gap-id: GAP-ui-024
domain: ui-layout
status: done
created: "2026-06-04T00:00:00Z"
closed: null
abandoned-reason: null
---

# WI-ui-024 — Migrate hardcoded colour literals to tokens across component CSS

**Scope:** `hub/client/src/screens/Specs.css`, `hub/client/src/screens/Gaps.css`, `hub/client/src/components/AgentChip.css` — replace raw hex colour literals with CSS custom property references (adding new tokens to `tokens.css` where no suitable token exists yet): coverage-dot status colours → `--st-*` tokens or new dot-specific tokens; syntax-highlight colours → new `--hl-*` tokens defined in both light and dark sets; agent-chip avatar background palette → new `--chip-av-*` tokens or use existing accent/status tokens.

**Acceptance criteria:**
- No raw hex literals remain in `Specs.css`, `Gaps.css`, or `AgentChip.css` for colours that have a token or where a token is being introduced
- Any new tokens introduced are defined in both the `:root` (light) block and the `[data-theme="dark"]` block in `tokens.css`
- Coverage dots for passing/failing/missing/skipped remain visually distinct in both light and dark mode
- Syntax-highlight colours remain legible (not identical to background) in both light and dark mode
- Agent-chip avatar backgrounds remain distinguishable in both themes
- Unit test: verify the CSS class definitions reference `var(--...)` rather than hex literals (snapshot or string-match test on the rendered style or CSS source)

---
id: WI-arch-002
gap-id: GAP-arch-002
domain: architecture
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Scaffold React + TypeScript + Vite frontend

**Scope:** `client/` — initialise Vite + React + TypeScript project; configure build output to `client/dist/`

**Acceptance criteria:**
- `npm run build` in `client/` produces a `dist/` directory with `index.html`
- `npm run dev` in `client/` starts a Vite dev server with HMR
- TypeScript strict mode enabled (`strict: true` in `tsconfig.json`)
- Test: `tsc --noEmit` exits 0 on the scaffolded project

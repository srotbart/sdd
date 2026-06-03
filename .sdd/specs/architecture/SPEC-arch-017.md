---
id: SPEC-arch-017
domain: architecture
abbrev: arch
status: active
aliases: []
version: "f04cd824"
---

# SPEC-arch-017 — Vite dev server listens on port 22400

The Vite dev server for `hub/client` is configured to listen on port `22400` instead of the default `5173`. This is set via `server.port: 22400` in `hub/client/vite.config.ts`.

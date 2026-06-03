---
id: SPEC-arch-012
domain: architecture
abbrev: arch
status: active
aliases: []
version: "350f3df2"
---

# SPEC-arch-012 — GET /browse-folder opens a native macOS folder picker and returns the selected path

The server exposes `GET /browse-folder` which invokes `osascript` to open the system folder-chooser dialog. It returns `{ path: string }` with the POSIX path of the selected folder, or `{ path: null }` if the user cancels. The endpoint is macOS-only for v1.

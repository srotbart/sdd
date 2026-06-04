---
id: SPEC-arch-008
domain: architecture
abbrev: arch
status: active
aliases: []
version: "41c25d5b"
---

# SPEC-arch-008 — Server listens on port 22351

The hub server listens on TCP port 22351. This port is fixed and not configurable.

**Tests:**
hub/server/spec-arch.test.ts > SPEC-arch-007/008: hub host and port are fixed config constants > SPEC-arch-008: server source pins PORT to 22351 — "the hub server port is fixed at 22351"

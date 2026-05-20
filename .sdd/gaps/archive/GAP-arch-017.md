---
id: GAP-arch-017
spec-item: SPEC-arch-014
spec-version: cb77f3fe
domain: architecture
status: closed
created: 2026-05-17
---

# Gap: parseTargets() does not read from targets/archive/

## Spec item

SPEC-arch-014 — GET /workspaces/:id/targets returns parsed target files as JSON

> The server reads all `*.md` files from `{path}/.sdd/targets/` **and** from `{path}/.sdd/targets/archive/`, and returns a JSON array of all target objects (both active and archived).

## Current behaviour

`parseTargets()` in `hub/server/sdd-parser.ts` reads only `*.md` files from the top-level `targets/` directory. The `archive/` subdirectory is never read, so archived targets are never included in the API response.

The route in `hub/server/index.ts` is correctly wired to `GET /workspaces/:id/targets` and calls `parseTargets()` — the gap is entirely in `parseTargets()`.

## Expected behaviour

`parseTargets()` should also read `*.md` files from `targets/archive/` and append them to the returned array, so the frontend receives both active and archived targets in a single response.

## Evidence

```
hub/server/sdd-parser.ts:164-179
export function parseTargets(sddPath: string): Target[] {
  const targetsDir = path.join(sddPath, "targets");
  // only reads the top-level directory; archive/ is never visited
  files = fs.readdirSync(targetsDir).filter((f) => f.endsWith(".md"));
  ...
}
```

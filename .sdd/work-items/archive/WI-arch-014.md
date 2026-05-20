---
id: WI-arch-014
gap: GAP-arch-017
spec-item: SPEC-arch-014
domain: architecture
status: done
created: 2026-05-17
---

# Work Item: Include archive targets in parseTargets()

## Scope

`hub/server/sdd-parser.ts` — update `parseTargets()` to also read `*.md` files from `targets/archive/` and append them to the returned array.

## Acceptance criteria

- `parseTargets()` reads all `*.md` files from both `{sddPath}/targets/` and `{sddPath}/targets/archive/`.
- Active targets from the top-level directory are returned.
- Archived targets from the archive subdirectory are returned.
- Both sets are combined into a single array.
- If the archive directory does not exist, the function returns only the active targets (no error).
- Existing tests continue to pass; new tests cover the archive-inclusion behaviour.

## Implementation notes

After reading active targets, attempt to read `targets/archive/`, catch if it doesn't exist, and append any parsed targets to the result array before returning.

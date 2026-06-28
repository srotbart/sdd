---
name: update-version
description: Use when the user wants to bump or set the SDD plugin's version — "bump the version", "up the version", "release 0.2.0", "update the plugin version", "cut a new version". Updates every version-bearing file in this repo in sync and verifies they match.
---

# Update Plugin Version

Bump (or set) this repo's plugin version, keeping **every** version declaration in sync.
The version lives in three files that have drifted apart before — always update all three.

## Version files

| File | Role |
|---|---|
| `plugin/.claude-plugin/plugin.json` | **Canonical** plugin manifest (the marketplace `source: ./plugin`). Read the current version from here. |
| `.claude-plugin/marketplace.json` | Marketplace entry (`plugins[].version`). Must match the canonical version. |
| `.claude-plugin/plugin.json` | Root manifest. Must match the canonical version. |

**Do NOT touch** the hub app's versions (`hub/package.json`, `hub/server/package.json`,
`hub/client/package.json`, `hub/package-lock.json`) or dependency versions — those are the web
app's own npm package version, unrelated to the plugin release.

If a future file also declares the **plugin** `"version"`, add it to the table and update it too.
Find plugin-manifest stragglers (scoped to the `.claude-plugin` manifests, excluding the hub app):

```bash
grep -rn '"version"' --include="*.json" .claude-plugin plugin/.claude-plugin
```

## Procedure

### 1. Read the current version

```bash
grep '"version"' plugin/.claude-plugin/plugin.json
```

### 2. Determine the target version

- If the user gave an explicit version (e.g. `0.2.0`), use it.
- Otherwise default to a **patch** bump: increment the last number (`0.1.5` → `0.1.6`).
- For a feature-bearing release the user may ask for a **minor** bump (`0.1.x` → `0.2.0`).
- Confirm the target with the user only if it is ambiguous; a plain "bump the version" → patch.

### 3. Update all three files to the target version

Set `"version": "<target>"` in each file. The marketplace and root files may currently be
**behind** the canonical one (drift) — set them to the target regardless of their old value, not
just +1 from where they happen to be.

```bash
NEW="0.1.6"   # the target
sed -i "s/\"version\": \"[0-9]*\.[0-9]*\.[0-9]*\"/\"version\": \"$NEW\"/" \
  plugin/.claude-plugin/plugin.json .claude-plugin/plugin.json .claude-plugin/marketplace.json
```

(`marketplace.json` has exactly one `"version"` — the plugin entry — so the blanket replace is safe.
If that ever changes, edit the `plugins[].version` field specifically.)

### 4. Verify they all match

```bash
grep -rn '"version"' plugin/.claude-plugin/plugin.json .claude-plugin/plugin.json .claude-plugin/marketplace.json
```

All three must show the same target version. If any differ, fix before finishing.

### 5. Report

State the bump plainly: `0.1.5 → 0.1.6 (3 files synced)`. Do **not** commit, push, tag, or open a
PR unless the user asks — leave that to the user's normal flow.

## Notes

- Individual `SKILL.md` frontmatter `version:` fields are **per-skill** and unrelated to the
  plugin version; do not touch them here.
- Spec item `version:` hashes are content checksums, also unrelated.

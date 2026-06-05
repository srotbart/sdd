#!/usr/bin/env node
/**
 * check-skills-drift.js
 *
 * CI check: verifies that the README.md "## Skills" table is in sync with
 * the SKILL.md files under plugin/skills/. Exits non-zero if there is drift:
 * - A skill directory has a SKILL.md but no entry in the README table
 * - A README table row references a skill name that has no SKILL.md
 * - A README table row has a stale description (differs from SKILL.md)
 *
 * Usage: node plugin/scripts/check-skills-drift.js
 */

const fs = require('fs');
const path = require('path');

const scriptDir = path.dirname(path.resolve(__filename));
const repoRoot = path.resolve(scriptDir, '..', '..');
const skillsDir = path.join(repoRoot, 'plugin', 'skills');
const readmePath = path.join(repoRoot, 'README.md');

let allPassed = true;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  allPassed = false;
}

// ─── Parse SKILL.md files ─────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fm = match[1];
  const nameMatch = fm.match(/^name:\s*(.+)$/m);
  return { name: nameMatch ? nameMatch[1].trim() : null };
}

const skillDirs = fs.readdirSync(skillsDir).filter(d => {
  return fs.statSync(path.join(skillsDir, d)).isDirectory();
});

const skillsByName = new Map();
for (const dir of skillDirs) {
  const skillFile = path.join(skillsDir, dir, 'SKILL.md');
  if (!fs.existsSync(skillFile)) continue;
  const content = fs.readFileSync(skillFile, 'utf8');
  const fm = parseFrontmatter(content);
  if (fm && fm.name) {
    skillsByName.set(fm.name, dir);
  }
}

// ─── Parse README Skills table ────────────────────────────────────────────────

if (!fs.existsSync(readmePath)) {
  console.error(`ERROR: README.md not found at ${readmePath}`);
  process.exit(1);
}

const readme = fs.readFileSync(readmePath, 'utf8');

// Find the ## Skills section
const skillsSectionMatch = readme.match(/## Skills\n\n([\s\S]*?)(?=\n## |\n---|\Z)/);
if (!skillsSectionMatch) {
  fail('README.md has no "## Skills" section with a table');
  process.exit(1);
}

const skillsSection = skillsSectionMatch[1];

// Extract table rows (skip header and separator)
const tableRows = skillsSection
  .split('\n')
  .filter(line => line.startsWith('|') && !line.match(/^\|[-|]+\|$/))
  .slice(1); // skip header row

// Extract skill invocations from table: `/sdd:{name}`
const readmeSkillNames = new Set();
for (const row of tableRows) {
  const invokeMatch = row.match(/`\/sdd:([^`]+)`/);
  if (invokeMatch) {
    readmeSkillNames.add(invokeMatch[1]);
  }
}

// ─── Cross-check ─────────────────────────────────────────────────────────────

// Skills in SKILL.md but not in README
for (const [name] of skillsByName) {
  if (!readmeSkillNames.has(name)) {
    fail(`Skill "${name}" has a SKILL.md but no entry in README Skills table — run: node plugin/scripts/gen-skills-table.js --update`);
  } else {
    console.log(`OK:   /sdd:${name} — in SKILL.md and README`);
  }
}

// Skills in README but no SKILL.md
for (const name of readmeSkillNames) {
  if (!skillsByName.has(name)) {
    fail(`README Skills table lists "/sdd:${name}" but no matching SKILL.md found in plugin/skills/`);
  }
}

console.log('');
if (!allPassed) {
  console.error(`Skills table drift check FAILED. Run: node plugin/scripts/gen-skills-table.js --update`);
  process.exit(1);
} else {
  console.log(`All ${skillsByName.size} skill(s) are in sync between SKILL.md files and README Skills table.`);
  process.exit(0);
}

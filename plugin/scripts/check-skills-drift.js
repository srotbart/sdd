#!/usr/bin/env node
/**
 * check-skills-drift.js
 *
 * CI check: verifies that:
 *   1. The README.md "## Skills" table is in sync with SKILL.md files.
 *   2. The sdd-help/SKILL.md "## All Skills" section lists every skill and
 *      has current (non-stale) blurbs matching each skill's SKILL.md description.
 *
 * Exits non-zero if there is drift in either check:
 * - A skill directory has a SKILL.md but no entry in the README table
 * - A README table row references a skill name that has no SKILL.md
 * - sdd-help is missing a skill listed in plugin/skills/
 * - sdd-help lists a skill that has no SKILL.md (orphan)
 * - sdd-help has a stale blurb (differs from what gen-sdd-help-skills.js would produce)
 *
 * Usage: node plugin/scripts/check-skills-drift.js
 * To fix: node plugin/scripts/gen-skills-table.js --update
 *          node plugin/scripts/gen-sdd-help-skills.js --update
 */

const fs = require('fs');
const path = require('path');

const scriptDir = path.dirname(path.resolve(__filename));
const repoRoot = path.resolve(scriptDir, '..', '..');
const skillsDir = path.join(repoRoot, 'plugin', 'skills');
const readmePath = path.join(repoRoot, 'README.md');
const sddHelpPath = path.join(skillsDir, 'sdd-help', 'SKILL.md');

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
  const descMatch = fm.match(/^description:\s*(.+)$/m);
  return {
    name: nameMatch ? nameMatch[1].trim() : null,
    description: descMatch ? descMatch[1].trim() : null,
  };
}

/**
 * Extract a concise help blurb from a skill description.
 * Must match the logic in gen-sdd-help-skills.js exactly.
 */
function extractBlurb(desc) {
  if (!desc) return '';
  let blurb = desc
    .replace(/^This skill should be used when the user invokes `[^`]+`,\s*/i, '')
    .replace(/^This skill should be used when the user\s*/i, '')
    .replace(/^Use when the user invokes `[^`]+`,\s*/i, '')
    .replace(/^Use when the user\s*/i, '');
  const sentenceEnd = blurb.search(/(?<=[^`])\. /);
  if (sentenceEnd > 0) {
    blurb = blurb.slice(0, sentenceEnd + 1);
  }
  blurb = blurb.replace(/\.$/, '').trim();
  return blurb;
}

const skillDirs = fs.readdirSync(skillsDir).filter(d => {
  return fs.statSync(path.join(skillsDir, d)).isDirectory();
});

const skillsByName = new Map(); // name → { dir, blurb }
for (const dir of skillDirs) {
  const skillFile = path.join(skillsDir, dir, 'SKILL.md');
  if (!fs.existsSync(skillFile)) continue;
  const content = fs.readFileSync(skillFile, 'utf8').replace(/\r\n/g, '\n');
  const fm = parseFrontmatter(content);
  if (fm && fm.name) {
    skillsByName.set(fm.name, { dir, blurb: extractBlurb(fm.description) });
  }
}

// ─── Check 1: README Skills table ────────────────────────────────────────────

console.log('─── Check 1: README Skills table ───────────────────────────────────────────');

if (!fs.existsSync(readmePath)) {
  console.error(`ERROR: README.md not found at ${readmePath}`);
  process.exit(1);
}

const readme = fs.readFileSync(readmePath, 'utf8').replace(/\r\n/g, '\n');

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

// ─── Check 2: sdd-help/SKILL.md "## All Skills" section ──────────────────────

console.log('');
console.log('─── Check 2: sdd-help/SKILL.md "## All Skills" section ─────────────────────');

if (!fs.existsSync(sddHelpPath)) {
  fail(`sdd-help/SKILL.md not found at ${sddHelpPath}`);
} else {
  const sddHelpContent = fs.readFileSync(sddHelpPath, 'utf8').replace(/\r\n/g, '\n');

  // Extract the "## All Skills" section
  const allSkillsMatch = sddHelpContent.match(/## All Skills\n([\s\S]*?)(?=\n## |\n---\s*$|$)/);
  if (!allSkillsMatch) {
    fail('sdd-help/SKILL.md has no "## All Skills" section — run: node plugin/scripts/gen-sdd-help-skills.js --update');
  } else {
    const allSkillsSection = allSkillsMatch[1];

    // Extract skill entries: ### `/sdd:{name}` — {displayName}\n{blurb}
    const sddHelpSkillNames = new Map(); // name → blurb
    const entryPattern = /### `\/sdd:([^`]+)`[^\n]*\n([^\n#]*)/g;
    let m;
    while ((m = entryPattern.exec(allSkillsSection)) !== null) {
      const name = m[1].trim();
      const blurb = m[2].trim();
      sddHelpSkillNames.set(name, blurb);
    }

    // Check: every skill in SKILL.md files appears in sdd-help
    for (const [name, { blurb: expectedBlurb }] of skillsByName) {
      if (!sddHelpSkillNames.has(name)) {
        fail(`sdd-help/SKILL.md "## All Skills" is missing skill "/sdd:${name}" — run: node plugin/scripts/gen-sdd-help-skills.js --update`);
      } else {
        const actualBlurb = sddHelpSkillNames.get(name);
        if (actualBlurb !== expectedBlurb) {
          fail(`sdd-help/SKILL.md "## All Skills" has stale blurb for "/sdd:${name}" — run: node plugin/scripts/gen-sdd-help-skills.js --update`);
          console.error(`  Expected: ${expectedBlurb}`);
          console.error(`  Actual:   ${actualBlurb}`);
        } else {
          console.log(`OK:   /sdd:${name} — in sdd-help with current blurb`);
        }
      }
    }

    // Check: no orphan skills in sdd-help (listed but no SKILL.md)
    for (const [name] of sddHelpSkillNames) {
      if (!skillsByName.has(name)) {
        fail(`sdd-help/SKILL.md "## All Skills" lists "/sdd:${name}" but no matching SKILL.md found — run: node plugin/scripts/gen-sdd-help-skills.js --update`);
      }
    }
  }
}

// ─── Final result ─────────────────────────────────────────────────────────────

console.log('');
if (!allPassed) {
  console.error('Skills drift check FAILED.');
  console.error('  To fix README:   node plugin/scripts/gen-skills-table.js --update');
  console.error('  To fix sdd-help: node plugin/scripts/gen-sdd-help-skills.js --update');
  process.exit(1);
} else {
  console.log(`All ${skillsByName.size} skill(s) are in sync with README Skills table and sdd-help/SKILL.md.`);
  process.exit(0);
}

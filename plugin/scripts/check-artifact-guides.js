#!/usr/bin/env node
/**
 * check-artifact-guides.js
 *
 * CI check: verifies that every artifact guide under plugin/references/artifacts/
 * contains all six required sections. Exits non-zero if any section is missing.
 *
 * Usage: node plugin/scripts/check-artifact-guides.js
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_SECTIONS = [
  /^## 1\. Schema \/ ID Convention/m,
  /^## 2\. Lifecycle/m,
  /^## 3\. Valid State Transitions/m,
  /^## 4\. Operating Procedure/m,
  /^## 5\. Invariants and Discipline/m,
  /^## 6\. Edge Cases/m,
];

const SECTION_NAMES = [
  '## 1. Schema / ID Convention',
  '## 2. Lifecycle',
  '## 3. Valid State Transitions',
  '## 4. Operating Procedure',
  '## 5. Invariants and Discipline',
  '## 6. Edge Cases',
];

// Find the repo root (parent of 'plugin/')
const scriptDir = path.dirname(path.resolve(__filename));
const repoRoot = path.resolve(scriptDir, '..', '..');
const artifactsDir = path.join(repoRoot, 'plugin', 'references', 'artifacts');

if (!fs.existsSync(artifactsDir)) {
  console.error(`ERROR: Artifacts directory not found: ${artifactsDir}`);
  process.exit(1);
}

const guides = fs.readdirSync(artifactsDir).filter(f => f.endsWith('.md'));

if (guides.length === 0) {
  console.error(`ERROR: No artifact guide files found in ${artifactsDir}`);
  process.exit(1);
}

let allPassed = true;

for (const guide of guides.sort()) {
  const filePath = path.join(artifactsDir, guide);
  const content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  const missing = [];

  REQUIRED_SECTIONS.forEach((pattern, i) => {
    if (!pattern.test(content)) {
      missing.push(SECTION_NAMES[i]);
    }
  });

  if (missing.length > 0) {
    console.error(`FAIL: ${guide} is missing ${missing.length} section(s):`);
    missing.forEach(s => console.error(`  - ${s}`));
    allPassed = false;
  } else {
    console.log(`OK:   ${guide} — all 6 sections present`);
  }
}

if (!allPassed) {
  console.error('\nArtifact guide check FAILED. Add the missing sections to the listed guides.');
  process.exit(1);
} else {
  console.log(`\nAll ${guides.length} artifact guide(s) passed the section check.`);
  process.exit(0);
}

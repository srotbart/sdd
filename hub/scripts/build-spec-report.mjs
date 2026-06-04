#!/usr/bin/env node
// Builds the merged Vitest report consumed by the SDD spec test-status mechanism.
//
// The Hub's test-mapping mechanism (SPEC-arch-019/020) reads ONE report file per
// domain. The ui-screens domain, however, is verified by tests in BOTH the client
// and server workspaces. This script runs each workspace's Vitest suite with the
// JSON reporter and merges their `testResults` into a single report at
// `hub/.vitest-report.json`, which `.sdd/specs/ui-screens/SPEC-ui-screens.tests.json`
// points at. Re-run after changing tests to refresh live status in the Specs UI.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const hubRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(hubRoot, "..");

const workspaces = [
  { name: "client", out: path.join(hubRoot, "client", ".vitest-report.json") },
  { name: "server", out: path.join(hubRoot, "server", ".vitest-report.json") },
];

for (const ws of workspaces) {
  console.log(`Running ${ws.name} suite with JSON reporter…`);
  execSync(`npx vitest run --reporter=json --outputFile="${ws.out}"`, {
    cwd: path.join(hubRoot, ws.name),
    stdio: "inherit",
  });
}

const merged = { startTime: 0, testResults: [] };
for (const ws of workspaces) {
  const report = JSON.parse(readFileSync(ws.out, "utf8"));
  merged.startTime = Math.max(merged.startTime, report.startTime || 0);
  merged.testResults.push(...(report.testResults || []));
}

const target = path.join(hubRoot, ".vitest-report.json");
writeFileSync(target, JSON.stringify(merged));
const assertions = merged.testResults.reduce(
  (n, s) => n + (s.assertionResults?.length || 0),
  0,
);
console.log(
  `Merged report written to ${path.relative(repoRoot, target)} (${assertions} assertions).`,
);

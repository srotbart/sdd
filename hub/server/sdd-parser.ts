import fs from "node:fs";
import path from "node:path";

interface SpecItem {
  id: string;
  title: string;
  status: "active" | "deprecated" | "aliased";
  version: string;
  body: string;
  invariant: string;
  criteria: string[];
  refs: Array<{ kind: "gap" | "wi"; id: string }>;
  testStatus: TestStatus;
}

interface Spec {
  id: string;
  domain: string;
  abbrev: string;
  items: SpecItem[];
}

function parseFrontmatter(content: string): { meta: Record<string, string>; body: string } {
  if (!content.startsWith("---")) {
    return { meta: {}, body: content };
  }
  const end = content.indexOf("---", 3);
  if (end === -1) {
    return { meta: {}, body: content };
  }
  const fmBlock = content.slice(3, end).trim();
  const body = content.slice(end + 3).trim();
  const meta: Record<string, string> = {};
  for (const line of fmBlock.split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, "");
    meta[key] = val;
  }
  return { meta, body };
}

function parseRefs(text: string): Array<{ kind: "gap" | "wi"; id: string }> {
  const refs: Array<{ kind: "gap" | "wi"; id: string }> = [];
  const gapRe = /GAP-[a-z]+-\d+/gi;
  const wiRe = /WI-[a-z]+-\d+/gi;
  for (const m of text.matchAll(gapRe)) {
    refs.push({ kind: "gap", id: m[0].toUpperCase() });
  }
  for (const m of text.matchAll(wiRe)) {
    refs.push({ kind: "wi", id: m[0].toUpperCase() });
  }
  return refs;
}

function parseSpecItemFile(filePath: string): (SpecItem & { domain: string; abbrev: string }) | null {
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }

  const { meta, body } = parseFrontmatter(content);
  if (!meta["id"] || !meta["domain"] || !meta["abbrev"]) return null;

  const titleMatch = /^# (SPEC-[^\s]+ — .+)$/m.exec(body);
  const title = titleMatch ? titleMatch[1].replace(/^SPEC-[^\s]+ — /, "").trim() : "";
  const bodyContent = body.replace(/^# .+\n?/m, "").trim();

  const sections = bodyContent.split(/\n(?=## )/);
  let invariant = "";
  const criteria: string[] = [];
  for (const section of sections) {
    if (section.startsWith("## Invariant")) {
      invariant = section.replace(/^## Invariant[ \t]*\n?/, "").trim();
    } else if (section.startsWith("## Acceptance criteria")) {
      const criteriaBody = section.replace(/^## Acceptance criteria[ \t]*\n?/, "");
      for (const line of criteriaBody.split("\n")) {
        const bullet = /^[-*]\s+(.+)$/.exec(line.trim());
        if (bullet) {
          criteria.push(bullet[1].trim());
        }
      }
    }
  }

  const status = (meta["status"]?.toLowerCase() ?? "active") as SpecItem["status"];

  // Detect **Tests:** skipped — <reason> convention (SPEC-scr-047)
  const skipMatch = /^\*\*Tests:\*\*\s+skipped\s+[—–-]+\s*(.+)$/m.exec(bodyContent);
  const testStatus: TestStatus = skipMatch
    ? { status: "skipped", skipReason: skipMatch[1].trim() }
    : { status: "not-run" };

  return {
    id: meta["id"].toUpperCase(),
    title,
    status,
    version: meta["version"] ?? "",
    body: bodyContent,
    invariant,
    criteria,
    refs: parseRefs(bodyContent),
    testStatus,
    domain: meta["domain"],
    abbrev: meta["abbrev"],
  };
}

interface DialogTurn {
  who: "user" | "agent";
  date: string;
  text: string;
}

interface Target {
  id: string;
  status: string;
  created: string;
  domain: string;
  domainAbbrev: string;
  title: string;
  statement: string;
  dialog: DialogTurn[];
}

function parseTargetFile(filePath: string): Target | null {
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }

  const { meta, body } = parseFrontmatter(content);
  if (!meta["id"] || !meta["status"]) return null;

  const titleMatch = /^# Target:\s*(.+)$/m.exec(body);
  const title = titleMatch ? titleMatch[1].trim() : "";

  const statementMatch = /^## Current statement\s*\n([\s\S]*?)(?=\n## |\s*$)/m.exec(body);
  const statement = statementMatch ? statementMatch[1].trim() : "";

  const dialog: DialogTurn[] = [];
  const dialogSection = /^## Dialog\s*\n([\s\S]*)$/m.exec(body)?.[1] ?? "";
  const turns = dialogSection.split(/(?=^### \d{4}-\d{2}-\d{2} — )/m).filter((s) => s.trim());
  for (const turn of turns) {
    const m = /^### (\d{4}-\d{2}-\d{2}) — (User|Agent)\s*\n([\s\S]*)$/.exec(turn.trim());
    if (!m) continue;
    dialog.push({
      who: m[2].toLowerCase() === "agent" ? "agent" : "user",
      date: m[1],
      text: m[3].trim(),
    });
  }

  const domain = meta["domain"] ?? "";
  const domainAbbrev = domain.split("-").map((p) => p.slice(0, 2)).join("").slice(0, 6) || domain;

  return {
    id: meta["id"],
    status: meta["status"],
    created: meta["created"] ?? "",
    domain,
    domainAbbrev,
    title,
    statement,
    dialog,
  };
}

export function parseTargets(sddPath: string): Target[] {
  const targetsDir = path.join(sddPath, "targets");
  let files: string[];
  try {
    files = fs.readdirSync(targetsDir).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }

  const targets: Target[] = [];
  for (const file of files) {
    const parsed = parseTargetFile(path.join(targetsDir, file));
    if (parsed) targets.push(parsed);
  }

  const archiveDir = path.join(targetsDir, "archive");
  let archiveFiles: string[];
  try {
    archiveFiles = fs.readdirSync(archiveDir).filter((f) => f.endsWith(".md"));
  } catch {
    return targets;
  }

  for (const file of archiveFiles) {
    const parsed = parseTargetFile(path.join(archiveDir, file));
    if (parsed) targets.push({ ...parsed, status: "archived" });
  }

  return targets;
}

export interface Gap {
  id: string;
  specItem: string;
  domain: string;
  status: string;
  discovered: string;
  auditVersion: string;
  closedBy: string | null;
  deferredReason: string | null;
  title: string;
  location: string;
  reasoning: string;
}

const ABBREV_TO_DOMAIN: Record<string, string> = {
  arch: "architecture",
  scr: "ui-screens",
  ui: "ui-layout",
  uic: "ui-components",
  wf: "workflow",
};

function deriveDomainFromSpecItem(specItem: string): string {
  const match = /^SPEC-([a-z]+)-\d+$/i.exec(specItem);
  if (!match) return "";
  const abbrev = match[1].toLowerCase();
  return ABBREV_TO_DOMAIN[abbrev] ?? abbrev;
}

function parseGapFile(filePath: string): Gap | null {
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }

  const { meta, body } = parseFrontmatter(content);
  if (!meta["id"] || !meta["status"]) return null;

  const titleMatch = /^# Gap:\s*(.+)$/m.exec(body);
  const title = titleMatch ? titleMatch[1].trim() : "";

  const locationMatch = /\*\*Locations?:\*\*\s*(.+?)(?=\n\n|\n\*\*|$)/s.exec(body);
  const location = locationMatch ? locationMatch[1].trim() : "";

  const reasoningMatch = /\*\*Reasoning:\*\*\s*(.+?)(?=\n\n|\n\*\*|$)/s.exec(body);
  const reasoning = reasoningMatch ? reasoningMatch[1].trim() : "";

  return {
    id: meta["id"],
    specItem: meta["spec-item"] ?? "",
    domain: meta["domain"] || deriveDomainFromSpecItem(meta["spec-item"] ?? ""),
    status: meta["status"],
    discovered: meta["discovered"] ?? "",
    auditVersion: meta["audit-spec-version"] ?? "",
    closedBy: meta["closed-by"] === "null" || !meta["closed-by"] ? null : meta["closed-by"],
    deferredReason: meta["deferred-reason"] === "null" || !meta["deferred-reason"] ? null : meta["deferred-reason"],
    title,
    location,
    reasoning,
  };
}

export function parseGaps(sddPath: string): Gap[] {
  const gapsDir = path.join(sddPath, "gaps");
  const gaps: Gap[] = [];

  let files: string[];
  try {
    files = fs.readdirSync(gapsDir).filter((f) => f.startsWith("GAP-") && f.endsWith(".md"));
  } catch {
    return gaps;
  }

  for (const file of files) {
    const parsed = parseGapFile(path.join(gapsDir, file));
    if (parsed) gaps.push(parsed);
  }

  const archiveDir = path.join(gapsDir, "archive");
  let archiveFiles: string[];
  try {
    archiveFiles = fs.readdirSync(archiveDir).filter((f) => f.startsWith("GAP-") && f.endsWith(".md"));
  } catch {
    return gaps;
  }

  for (const file of archiveFiles) {
    const parsed = parseGapFile(path.join(archiveDir, file));
    if (parsed) gaps.push(parsed);
  }

  return gaps;
}

export interface WorkItem {
  id: string;
  gapId: string | string[] | null;
  domain: string;
  status: string;
  created: string;
  abandonedReason: string | null;
  closed: string | null;
  title: string;
  scope: string;
  acceptance: string[];
  progressNote: string | null;
  blockedReason: string | null;
}

function parseWorkItemFile(filePath: string): WorkItem | null {
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }

  const { meta, body } = parseFrontmatter(content);
  if (!meta["id"] || !meta["status"]) return null;

  const rawGapId = meta["gap-id"] ?? null;
  let gapId: string | string[] | null = null;
  if (rawGapId && rawGapId !== "null") {
    const arrayMatch = /^\[(.+)\]$/.exec(rawGapId);
    if (arrayMatch) {
      gapId = arrayMatch[1].split(",").map((s) => s.trim());
    } else {
      gapId = rawGapId;
    }
  }

  const titleMatch = /^# Work Item:\s*(.+)$/m.exec(body);
  const title = titleMatch ? titleMatch[1].trim() : "";

  const scopeMatch = /\*\*Scope:\*\*\s*(.+?)(?=\n\n|\n\*\*|$)/s.exec(body);
  const scope = scopeMatch ? scopeMatch[1].trim() : "";

  const acceptanceMatch = /\*\*Acceptance criteria:\*\*\s*\n([\s\S]*?)(?=\n\*\*|$)/s.exec(body);
  const acceptance: string[] = [];
  if (acceptanceMatch) {
    for (const line of acceptanceMatch[1].split("\n")) {
      const bullet = /^[-*]\s+(.+)$/.exec(line.trim());
      if (bullet) {
        acceptance.push(bullet[1].trim());
      }
    }
  }

  const progressMatch = /\*\*Progress:\*\*\s*(.+?)(?=\n\n|\n\*\*|$)/s.exec(body);
  const progressNote = progressMatch ? progressMatch[1].trim() : null;

  const blockedMatch = /\*\*Blocked:\*\*\s*(.+?)(?=\n\n|\n\*\*|$)/s.exec(body);
  const blockedReason = blockedMatch ? blockedMatch[1].trim() : null;

  return {
    id: meta["id"],
    gapId,
    domain: meta["domain"] ?? "",
    status: meta["status"],
    created: meta["created"] ?? "",
    abandonedReason: meta["abandoned-reason"] === "null" || !meta["abandoned-reason"] ? null : meta["abandoned-reason"],
    closed: meta["closed"] ?? null,
    title,
    scope,
    acceptance,
    progressNote,
    blockedReason,
  };
}

export function parseWorkItems(sddPath: string): WorkItem[] {
  const workItemsDir = path.join(sddPath, "work-items");
  const items: WorkItem[] = [];

  let files: string[];
  try {
    files = fs.readdirSync(workItemsDir).filter((f) => f.startsWith("WI-") && f.endsWith(".md"));
  } catch {
    return items;
  }

  for (const file of files) {
    const parsed = parseWorkItemFile(path.join(workItemsDir, file));
    if (parsed) items.push(parsed);
  }

  const archiveDir = path.join(workItemsDir, "archive");
  let archiveFiles: string[];
  try {
    archiveFiles = fs.readdirSync(archiveDir).filter((f) => f.startsWith("WI-") && f.endsWith(".md"));
  } catch {
    return items;
  }

  for (const file of archiveFiles) {
    const parsed = parseWorkItemFile(path.join(archiveDir, file));
    if (parsed) items.push(parsed);
  }

  return items;
}

export function parseSpecs(sddPath: string): Spec[] {
  const specsDir = path.join(sddPath, "specs");
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(specsDir, { withFileTypes: true });
  } catch {
    return [];
  }

  const workspaceRoot = path.dirname(sddPath);
  const specsByDomain = new Map<string, Spec>();

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name === "archive") continue;
    const domainDir = path.join(specsDir, entry.name);

    const specFilePaths: string[] = [];

    let domainFiles: string[];
    try {
      domainFiles = fs.readdirSync(domainDir).filter((f) => f.startsWith("SPEC-") && f.endsWith(".md"));
    } catch {
      continue;
    }
    for (const f of domainFiles) {
      specFilePaths.push(path.join(domainDir, f));
    }

    let subEntries: fs.Dirent[];
    try {
      subEntries = fs.readdirSync(domainDir, { withFileTypes: true });
    } catch {
      subEntries = [];
    }
    for (const sub of subEntries) {
      if (!sub.isDirectory() || sub.name === "archive") continue;
      const subDir = path.join(domainDir, sub.name);
      let subFiles: string[];
      try {
        subFiles = fs.readdirSync(subDir).filter((f) => f.startsWith("SPEC-") && f.endsWith(".md"));
      } catch {
        continue;
      }
      for (const f of subFiles) {
        specFilePaths.push(path.join(subDir, f));
      }
    }

    for (const filePath of specFilePaths) {
      const parsed = parseSpecItemFile(filePath);
      if (!parsed) continue;

      let spec = specsByDomain.get(parsed.domain);
      if (!spec) {
        spec = { id: `SPEC-${parsed.abbrev}`, domain: parsed.domain, abbrev: parsed.abbrev, items: [] };
        specsByDomain.set(parsed.domain, spec);
      }
      const { domain: _d, abbrev: _a, ...item } = parsed;
      spec.items.push(item);
    }
  }

  for (const spec of specsByDomain.values()) {
    spec.items.sort((a, b) => a.id.localeCompare(b.id));

    const mapping = readTestMapping(sddPath, spec.abbrev, spec.domain);
    let report = null;
    if (mapping) {
      const absReport = path.isAbsolute(mapping.report)
        ? mapping.report
        : path.join(workspaceRoot, mapping.report);
      report = mapping.runner === "vitest"
        ? parseVitestReport(absReport)
        : parseSurefireReports(absReport);
    }

    for (const item of spec.items) {
      // Preserve skip state set by parseSpecItemFile — do not overwrite with computed status
      if (item.testStatus.status === "skipped") continue;
      item.testStatus = computeTestStatus(item.id, mapping, report);
    }
  }

  return Array.from(specsByDomain.values());
}

// --- Test mapping and report parsing (SPEC-arch-019 through SPEC-arch-022) ---

export interface TestMapping {
  runner: "vitest" | "maven";
  report: string;
  items: Record<string, string[]>;
}

export interface ParsedTestResult {
  fullName: string;
  status: "passed" | "failed";
}

export interface ParsedReport {
  tests: ParsedTestResult[];
  runAt: string;
}

export type PerTestResult = {
  fullName: string;
  status: "passing" | "failing" | "missing";
  lastRun?: string;
};

export type TestStatus = {
  status: "passing" | "failing" | "missing" | "not-run" | "skipped";
  lastRun?: string;
  skipReason?: string;
  tests?: PerTestResult[];
};

export function readTestMapping(sddPath: string, abbrev: string, domain: string): TestMapping | null {
  const mappingPath = path.join(sddPath, "specs", domain, `SPEC-${abbrev}.tests.json`);
  let raw: string;
  try {
    raw = fs.readFileSync(mappingPath, "utf8");
  } catch {
    return null;
  }
  try {
    return JSON.parse(raw) as TestMapping;
  } catch {
    return null;
  }
}

export function parseVitestReport(reportPath: string): ParsedReport | null {
  let raw: string;
  try {
    raw = fs.readFileSync(reportPath, "utf8");
  } catch {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }
  const report = parsed as Record<string, unknown>;
  const startTime = typeof report["startTime"] === "number" ? report["startTime"] : 0;
  const runAt = new Date(startTime).toISOString();
  const testResults = Array.isArray(report["testResults"]) ? report["testResults"] : [];
  const tests: ParsedTestResult[] = [];
  for (const suite of testResults) {
    if (typeof suite !== "object" || suite === null) continue;
    const assertionResults = (suite as Record<string, unknown>)["assertionResults"];
    if (!Array.isArray(assertionResults)) continue;
    for (const assertion of assertionResults) {
      if (typeof assertion !== "object" || assertion === null) continue;
      const a = assertion as Record<string, unknown>;
      const fullName = typeof a["fullName"] === "string" ? a["fullName"] : "";
      const status = a["status"] === "passed" ? "passed" : "failed";
      tests.push({ fullName, status });
    }
  }
  return { tests, runAt };
}

export function parseSurefireReports(dir: string): ParsedReport | null {
  let xmlFiles: string[];
  try {
    xmlFiles = fs.readdirSync(dir).filter((f) => f.startsWith("TEST-") && f.endsWith(".xml"));
  } catch {
    return null;
  }
  if (xmlFiles.length === 0) {
    return null;
  }

  const tests: ParsedTestResult[] = [];
  let runAt = "";

  for (const file of xmlFiles) {
    const content = fs.readFileSync(path.join(dir, file), "utf8");

    const suiteTimestampMatch = /timestamp="([^"]+)"/.exec(content);
    if (suiteTimestampMatch && !runAt) {
      runAt = new Date(suiteTimestampMatch[1]).toISOString();
    }

    const testcaseRe = /<testcase\s([^>]*?)(\/>|>([\s\S]*?)<\/testcase>)/g;
    for (const m of content.matchAll(testcaseRe)) {
      const attrs = m[1];
      const body = m[3] ?? "";
      const classname = (/classname="([^"]*)"/.exec(attrs) ?? [])[1] ?? "";
      const name = (/\bname="([^"]*)"/.exec(attrs) ?? [])[1] ?? "";
      const fullName = `${classname} ${name}`.trim();
      const failed = /<failure[\s>]/.test(body) || /<error[\s>]/.test(body);
      tests.push({ fullName, status: failed ? "failed" : "passed" });
    }
  }

  return { tests, runAt };
}

export function computeTestStatus(
  specItemId: string,
  mapping: TestMapping | null,
  report: ParsedReport | null
): TestStatus {
  if (report === null) {
    return { status: "not-run", tests: [] };
  }

  if (mapping === null) {
    return { status: "missing", lastRun: report.runAt, tests: [] };
  }

  const substrings = mapping.items[specItemId];
  if (!substrings || substrings.length === 0) {
    return { status: "missing", lastRun: report.runAt, tests: [] };
  }

  // Build per-test results: one entry per mapped substring
  const tests: PerTestResult[] = substrings.map((sub) => {
    const match = report.tests.find((t) =>
      t.fullName.toLowerCase().includes(sub.toLowerCase())
    );
    if (!match) {
      return { fullName: sub, status: "missing" as const };
    }
    return {
      fullName: match.fullName,
      status: match.status === "failed" ? "failing" as const : "passing" as const,
      lastRun: report.runAt,
    };
  });

  const allMissing = tests.every((t) => t.status === "missing");
  if (allMissing) {
    return { status: "missing", lastRun: report.runAt, tests };
  }

  const anyFailed = tests.some((t) => t.status === "failing");
  return { status: anyFailed ? "failing" : "passing", lastRun: report.runAt, tests };
}

import fs from "node:fs";
import path from "node:path";

interface SpecItem {
  id: string;
  title: string;
  status: "active" | "deprecated" | "aliased";
  body: string;
  refs: Array<{ kind: "gap" | "wi"; id: string }>;
}

interface Spec {
  id: string;
  domain: string;
  abbrev: string;
  version: string;
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

function parseSpecFile(filePath: string): Spec | null {
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }

  const { meta, body } = parseFrontmatter(content);
  if (!meta["abbrev"] || !meta["domain"]) return null;

  const abbrev = meta["abbrev"];
  const itemHeaderRe = new RegExp(
    `^## (SPEC-${abbrev}-\\d+) — (.+)$`,
    "m"
  );
  const sections = body.split(/^## /m).filter((s) => s.trim());

  const items: SpecItem[] = [];
  for (const section of sections) {
    const firstLine = section.split("\n")[0].trim();
    const headerMatch = new RegExp(`^(SPEC-${abbrev}-\\d+) — (.+)$`, "i").exec(firstLine);
    if (!headerMatch) continue;

    const id = headerMatch[1].toUpperCase();
    const title = headerMatch[2].trim();
    const rest = section.slice(firstLine.length).trim();

    const statusMatch = /\*Status:\s*(active|deprecated|aliased)/i.exec(rest);
    const status = (statusMatch?.[1]?.toLowerCase() ?? "active") as SpecItem["status"];

    const bodyLines = rest
      .split("\n")
      .filter((l) => !l.match(/^\*Status:/i))
      .join("\n")
      .trim();

    items.push({ id, title, status, body: bodyLines, refs: parseRefs(rest) });
  }

  return {
    id: meta["id"] ?? path.basename(filePath, ".md"),
    domain: meta["domain"],
    abbrev,
    version: meta["version"] ?? "",
    items,
  };

  void itemHeaderRe;
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
  const turnRe = /^### \d{4}-\d{2}-\d{2} — (User|Agent)\n([\s\S]*?)(?=\n### |\s*$)/gm;
  for (const m of body.matchAll(turnRe)) {
    dialog.push({
      who: m[1].toLowerCase() === "agent" ? "agent" : "user",
      date: (m[0].match(/(\d{4}-\d{2}-\d{2})/) ?? [])[1] ?? "",
      text: m[2].trim(),
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
    if (parsed) targets.push(parsed);
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
    domain: meta["domain"] ?? "",
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
  let files: string[];
  try {
    files = fs.readdirSync(specsDir).filter((f) => f.startsWith("SPEC-") && f.endsWith(".md"));
  } catch {
    return [];
  }

  const specs: Spec[] = [];
  for (const file of files) {
    const parsed = parseSpecFile(path.join(specsDir, file));
    if (parsed) specs.push(parsed);
  }
  return specs;
}

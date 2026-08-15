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
  // Full component path (e.g. "hub/client/screens"). Legacy `domain:` items
  // get a one-segment path equal to the domain name.
  component?: string;
  // Present on contract items: the binding to the consuming component, with
  // endpoint-item version stamps from the last verification. Status is
  // derived by comparing stamps to current versions — never stored.
  contract?: { consumer: string; synced: Array<{ item: string; stamp: string }> };
}

interface Spec {
  id: string;
  domain: string;
  abbrev: string;
  items: SpecItem[];
}

// Keys whose values are identifiers/enums/paths — safe (and documented) to
// carry inline # comments. Free-text keys are deliberately absent.
const STRUCTURAL_KEYS = new Set([
  "id", "component", "domain", "abbrev", "status", "version", "aliases",
  "scope", "spec-item", "gap-id", "audit-spec-version", "closed-by",
  "contract-consumer", "contract-synced", "created", "discovered", "design",
]);

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
    // Strip inline comments ("component: hub/server  # note") on STRUCTURAL
    // keys only — the artifact templates show them there. Free-text fields
    // (reasons, titles) may legitimately contain " #" (issue refs) and must
    // never be truncated.
    let raw = line.slice(colon + 1);
    if (STRUCTURAL_KEYS.has(key)) {
      raw = raw.replace(/\s+#.*$/, "");
    }
    const val = raw.trim().replace(/^["']|["']$/g, "");
    meta[key] = val;
  }
  return { meta, body };
}

function parseRefs(text: string): Array<{ kind: "gap" | "wi"; id: string }> {
  const refs: Array<{ kind: "gap" | "wi"; id: string }> = [];
  // Both suffix forms are valid (sequential and 7-hex hash), and abbrevs may
  // contain hyphens: GAP-auth-001, GAP-auth-3f9c2a1, GAP-ui-screens-001.
  // The suffix is anchored to digits or 7-hex so prose like
  // "gap-to-work-items" never mints a ref.
  const gapRe = /GAP-[a-z][a-z0-9-]*?-(?:\d+|[0-9a-f]{7})\b/gi;
  const wiRe = /WI-[a-z][a-z0-9-]*?-(?:\d+|[0-9a-f]{7})\b/gi;
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
  // `component:` (path form) supersedes legacy `domain:`; accept either.
  const componentPath = meta["component"] ?? meta["domain"];
  if (!meta["id"] || !componentPath || !meta["abbrev"]) return null;

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

  // Contract binding: `contract-consumer` + `contract-synced` flow list of
  // `{spec-item-id}@{version-hash}` stamps. The list is matched against the
  // raw frontmatter block so a wrapped multi-line list is read whole — the
  // line-oriented meta would silently truncate it to the first line's
  // entries, and a dropped drifted endpoint would read as in-sync. Malformed
  // or unterminated lists yield zero entries → binding status "unknown"
  // (fail-closed), never a false in-sync.
  let contract: SpecItem["contract"];
  if (meta["contract-consumer"]) {
    const synced: Array<{ item: string; stamp: string }> = [];
    const fmBlock = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(content)?.[1] ?? "";
    const listMatch = /^contract-synced:[ \t]*\[([^\]]*)\]/m.exec(fmBlock);
    if (listMatch) {
      for (const entry of listMatch[1].split(",")) {
        const m = /^([A-Za-z0-9-]+)@([0-9a-fA-F]+)$/.exec(entry.trim());
        if (m) synced.push({ item: m[1].toUpperCase(), stamp: m[2].toLowerCase() });
      }
    }
    contract = { consumer: meta["contract-consumer"], synced };
  }

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
    component: componentPath,
    contract,
    // Grouping key: the area (first path segment). For legacy `domain:` items
    // the path has one segment, so this equals the old domain grouping.
    domain: componentPath.split("/")[0],
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

// Derives a short abbreviation from a domain slug ("ui-screens" → "uisc") or a
// component path ("hub/client/screens" → the last segment's abbrev, "sc").
// Intentionally mirrored in hub/client/src/App.tsx > mapApiTarget; keep in sync.
function deriveDomainAbbrev(domain: string): string {
  const leaf = domain.split("/").filter(Boolean).pop() ?? domain;
  return leaf.split("-").map((p) => p.slice(0, 2)).join("").slice(0, 6) || leaf;
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

  // Capture everything from the heading up to the next `## ` section (e.g. `## Dialog`)
  // or end of file. No `/m` flag and no `\s*$` alternative: those made the lazy capture
  // stop at the first line break, truncating multi-paragraph statements to one line.
  const statementMatch = /## Current statement[ \t]*\r?\n([\s\S]*?)(?=\r?\n## |$)/.exec(body);
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

  // `component:` (path form) supersedes legacy `domain:`; accept either.
  const domain = meta["component"] ?? meta["domain"] ?? "";
  // Intentionally mirrored in hub/client/src/App.tsx > mapApiTarget; keep in sync.
  const domainAbbrev = deriveDomainAbbrev(domain);

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

/**
 * Read every matching artifact file in `.sdd/{subdir}/` and its `archive/`
 * subdirectory, parsing each with `parseFile`. Missing directories yield no
 * entries; files that fail to parse (parseFile returns null) are skipped.
 * `fromArchive`, when given, transforms entries read from `archive/` (e.g. to
 * stamp `status: "archived"`). Shared scaffold for the flat artifact lists
 * (targets, gaps, work-items, issues, improvements).
 */
function collectArtifacts<T>(
  sddPath: string,
  subdir: string,
  matches: (file: string) => boolean,
  parseFile: (filePath: string) => T | null,
  fromArchive?: (item: T) => T,
): T[] {
  const dir = path.join(sddPath, subdir);
  const out: T[] = [];

  const readDir = (d: string): string[] => {
    try {
      return fs.readdirSync(d).filter(matches);
    } catch {
      return [];
    }
  };

  for (const file of readDir(dir)) {
    const parsed = parseFile(path.join(dir, file));
    if (parsed) out.push(parsed);
  }

  const archiveDir = path.join(dir, "archive");
  for (const file of readDir(archiveDir)) {
    const parsed = parseFile(path.join(archiveDir, file));
    if (parsed) out.push(fromArchive ? fromArchive(parsed) : parsed);
  }

  return out;
}

export function parseTargets(sddPath: string): Target[] {
  return collectArtifacts(
    sddPath,
    "targets",
    (f) => f.endsWith(".md"),
    parseTargetFile,
    (t) => ({ ...t, status: "archived" }),
  );
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
  // Abbrevs may contain hyphens and suffixes may be sequential or 7-hex —
  // same forms parseRefs accepts (SPEC-ui-screens-004, SPEC-auth-3f9c2a1).
  const match = /^SPEC-([a-z][a-z0-9-]*)-(?:\d+|[0-9a-f]{7})$/i.exec(specItem);
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
    domain: meta["component"] || meta["domain"] || deriveDomainFromSpecItem(meta["spec-item"] ?? ""),
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
  return collectArtifacts(
    sddPath,
    "gaps",
    (f) => f.startsWith("GAP-") && f.endsWith(".md"),
    parseGapFile,
  );
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
    domain: meta["component"] ?? meta["domain"] ?? "",
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
  return collectArtifacts(
    sddPath,
    "work-items",
    (f) => f.startsWith("WI-") && f.endsWith(".md"),
    parseWorkItemFile,
  );
}

// ---- Issues (ISS-*) -------------------------------------------------------

export interface Issue {
  id: string;
  domain: string;
  severity: string;
  status: string;
  title: string;
  body: string;
  discovered: string;
}

function parseIssueFile(filePath: string): Issue | null {
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
  const { meta, body } = parseFrontmatter(content);
  if (!meta["id"] || !meta["status"]) return null;
  const titleMatch = /^# (?:Issue|ISS-[^\s]+)[:\s]*(.*)$/m.exec(body);
  const title = titleMatch ? titleMatch[1].trim() : meta["id"];
  return {
    id: meta["id"],
    domain: meta["component"] ?? meta["domain"] ?? "",
    severity: meta["severity"] ?? "medium",
    status: meta["status"],
    title,
    body: body.replace(/^# .+\n?/m, "").trim(),
    discovered: meta["discovered"] ?? "",
  };
}

export function parseIssues(sddPath: string): Issue[] {
  return collectArtifacts(
    sddPath,
    "issues",
    (f) => f.startsWith("ISS-") && f.endsWith(".md"),
    parseIssueFile,
  );
}

// ---- Improvements (IMP-*) -------------------------------------------------

export interface Improvement {
  id: string;
  domain: string;
  effort: string;
  impact: string;
  status: string;
  title: string;
  body: string;
  discovered: string;
}

function parseImprovementFile(filePath: string): Improvement | null {
  let content: string;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
  const { meta, body } = parseFrontmatter(content);
  if (!meta["id"] || !meta["status"]) return null;
  const titleMatch = /^# (?:Improvement|IMP-[^\s]+)[:\s]*(.*)$/m.exec(body);
  const title = titleMatch ? titleMatch[1].trim() : meta["id"];
  return {
    id: meta["id"],
    domain: meta["component"] ?? meta["domain"] ?? "",
    effort: meta["effort"] ?? "medium",
    impact: meta["impact"] ?? "medium",
    status: meta["status"],
    title,
    body: body.replace(/^# .+\n?/m, "").trim(),
    discovered: meta["discovered"] ?? "",
  };
}

export function parseImprovements(sddPath: string): Improvement[] {
  return collectArtifacts(
    sddPath,
    "improvements",
    (f) => f.startsWith("IMP-") && f.endsWith(".md"),
    parseImprovementFile,
  );
}

// ---- Standards (readable docs from .sdd/standards/) ----------------------

export interface StandardsFile {
  name: string;
  content: string;
}

export function parseStandards(sddPath: string): StandardsFile[] {
  const standardsDir = path.join(sddPath, "standards");
  const result: StandardsFile[] = [];
  let files: string[];
  try {
    files = fs.readdirSync(standardsDir).filter((f) => f.endsWith(".md") && !f.startsWith("."));
  } catch {
    return result;
  }
  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(standardsDir, file), "utf8");
      result.push({ name: file, content });
    } catch {
      // skip unreadable files
    }
  }
  return result;
}

// ---------------------------------------------------------------------------

/**
 * Walk the `.sdd/specs/` component tree (any depth, skipping `archive/` at
 * every level) and collect spec item files plus test-mapping files
 * (`SPEC-{abbrev}.tests.json`, wherever they sit). Single source for the
 * specs-tree walk — the watcher reuses this so the two never drift on what
 * counts as a mapping file. Output is sorted for determinism.
 */
export function collectSpecsTree(specsDir: string): {
  specFiles: string[];
  mappingFiles: Array<{ abbrev: string; filePath: string }>;
  manifestFiles: Array<{ componentPath: string; filePath: string }>;
} {
  const specFiles: string[] = [];
  const mappingFiles: Array<{ abbrev: string; filePath: string }> = [];
  const manifestFiles: Array<{ componentPath: string; filePath: string }> = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(specsDir, { withFileTypes: true });
  } catch {
    return { specFiles, mappingFiles, manifestFiles };
  }

  const walk = (dir: string, rel: string): void => {
    let dirEntries: fs.Dirent[];
    try {
      dirEntries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of dirEntries) {
      if (e.isDirectory()) {
        if (e.name !== "archive") walk(path.join(dir, e.name), rel ? `${rel}/${e.name}` : e.name);
        continue;
      }
      if (e.name === "component.md" && rel) {
        manifestFiles.push({ componentPath: rel, filePath: path.join(dir, e.name) });
        continue;
      }
      const mappingMatch = /^SPEC-(.+)\.tests\.json$/i.exec(e.name);
      if (mappingMatch) {
        mappingFiles.push({ abbrev: mappingMatch[1].toLowerCase(), filePath: path.join(dir, e.name) });
        continue;
      }
      if (e.name.startsWith("SPEC-") && e.name.endsWith(".md")) {
        specFiles.push(path.join(dir, e.name));
      }
    }
  };

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === "archive") continue;
    walk(path.join(specsDir, entry.name), entry.name);
  }

  specFiles.sort();
  mappingFiles.sort((a, b) => a.filePath.localeCompare(b.filePath));
  manifestFiles.sort((a, b) => a.componentPath.localeCompare(b.componentPath));
  return { specFiles, mappingFiles, manifestFiles };
}

export function parseSpecs(sddPath: string, tree?: ReturnType<typeof collectSpecsTree>): Spec[] {
  const specsDir = path.join(sddPath, "specs");
  const workspaceRoot = path.dirname(sddPath);
  const specsByDomain = new Map<string, Spec>();

  // Components nest to any depth. Legacy flat/subject layouts are shallow
  // trees and parse identically. Several mapping files may share an abbrev (a
  // documented misconfiguration), so all candidates are kept and
  // disambiguated by directory proximity to the item. Callers that already
  // walked the tree (component-graph) pass it in to avoid a second walk.
  const { specFiles: specFilePaths, mappingFiles } = tree ?? collectSpecsTree(specsDir);

  // Per-item metadata needed after grouping: the frontmatter abbrev (the
  // authoritative mapping-file key — item IDs may use a different shorthand,
  // e.g. `id: SPEC-scr-001` under `abbrev: ui-screens`) and the item's
  // directory (for proximity disambiguation). Keyed by item object, not ID —
  // duplicate IDs are a documented misconfiguration and must not make one
  // item's metadata shadow another's.
  const itemMeta = new WeakMap<SpecItem, { abbrev: string; dir: string }>();

  for (const filePath of specFilePaths) {
    const parsed = parseSpecItemFile(filePath);
    if (!parsed) continue;

    let spec = specsByDomain.get(parsed.domain);
    if (!spec) {
      spec = { id: `SPEC-${parsed.abbrev}`, domain: parsed.domain, abbrev: parsed.abbrev, items: [] };
      specsByDomain.set(parsed.domain, spec);
    }
    const { domain: _d, abbrev: _a, ...item } = parsed;
    itemMeta.set(item, { abbrev: parsed.abbrev.toLowerCase(), dir: path.dirname(filePath) });
    spec.items.push(item);
  }

  // A multi-component area holds items with several abbrevs; naming the group
  // after whichever file parsed first would be arbitrary. When abbrevs are
  // mixed, name the group after the area itself.
  for (const spec of specsByDomain.values()) {
    const abbrevs = new Set(spec.items.map((i) => itemMeta.get(i)?.abbrev ?? spec.abbrev.toLowerCase()));
    if (abbrevs.size > 1) {
      spec.abbrev = spec.domain;
      spec.id = `SPEC-${spec.domain}`;
    }
  }

  const mappingCache = new Map<string, { mapping: TestMapping; report: ParsedReport | null } | null>();
  const loadMappingWithReport = (mappingPath: string): { mapping: TestMapping; report: ParsedReport | null } | null => {
    if (mappingCache.has(mappingPath)) return mappingCache.get(mappingPath) ?? null;
    let resolved: { mapping: TestMapping; report: ParsedReport | null } | null = null;
    let raw: string | null = null;
    try {
      raw = fs.readFileSync(mappingPath, "utf8");
    } catch {
      // Unreadable mapping file is treated as absent: test status degrades
      // to not-run rather than failing the whole parse.
      raw = null;
    }
    const mapping = raw === null ? null : validateTestMapping(raw);
    if (mapping) {
      const absReport = path.isAbsolute(mapping.report)
        ? mapping.report
        : path.join(workspaceRoot, mapping.report);
      const report = mapping.runner === "vitest"
        ? parseVitestReport(absReport)
        : parseSurefireReports(absReport);
      resolved = { mapping, report };
    }
    mappingCache.set(mappingPath, resolved);
    return resolved;
  };

  // Length of the shared leading path between a mapping file's directory and
  // an item's directory — the mapping sitting next to (or above) the item wins.
  const proximity = (mappingPath: string, itemDir: string): number => {
    const a = path.dirname(mappingPath).split(path.sep);
    const b = itemDir.split(path.sep);
    let n = 0;
    while (n < a.length && n < b.length && a[n] === b[n]) n++;
    return n;
  };

  for (const spec of specsByDomain.values()) {
    spec.items.sort((a, b) => a.id.localeCompare(b.id));

    for (const item of spec.items) {
      // Preserve skip state set by parseSpecItemFile — do not overwrite with computed status
      if (item.testStatus.status === "skipped") continue;

      const meta = itemMeta.get(item);
      const idMatch = /^SPEC-([a-z0-9-]+)-[a-z0-9]+$/i.exec(item.id);
      const idAbbrev = idMatch ? idMatch[1].toLowerCase() : null;
      // Candidate mappings: the frontmatter abbrev is authoritative and may
      // match a mapping anywhere in the tree. The ID-derived shorthand is a
      // weaker signal (legacy filename convention), accepted only for mapping
      // files in the item's own directory chain — otherwise an unrelated
      // component whose abbrev happens to equal this item's ID shorthand
      // would capture the item and stamp it with a foreign report.
      const inOwnChain = (m: { filePath: string }): boolean =>
        meta !== undefined && (meta.dir + path.sep).startsWith(path.dirname(m.filePath) + path.sep);
      const matches = mappingFiles.filter(
        (m) =>
          (meta && m.abbrev === meta.abbrev) ||
          (idAbbrev !== null && m.abbrev === idAbbrev && inOwnChain(m))
      );
      let best: { mapping: TestMapping; report: ParsedReport | null } | null = null;
      if (matches.length > 0 && meta) {
        matches.sort((a, b) => proximity(b.filePath, meta.dir) - proximity(a.filePath, meta.dir));
        for (const m of matches) {
          best = loadMappingWithReport(m.filePath);
          if (best) break;
        }
      } else if (matches.length > 0) {
        best = loadMappingWithReport(matches[0].filePath);
      }

      item.testStatus = computeTestStatus(item.id, best?.mapping ?? null, best?.report ?? null);
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

// Shape-guard raw mapping JSON. A mapping file that parses as JSON but lacks
// the required fields must yield null, not a TestMapping with undefined
// members — `path.isAbsolute(undefined)` would throw deep in the request
// path (and in the watcher) otherwise.
function validateTestMapping(raw: string): TestMapping | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const m = parsed as Record<string, unknown>;
  if (m["runner"] !== "vitest" && m["runner"] !== "maven") return null;
  if (typeof m["report"] !== "string") return null;
  if (typeof m["items"] !== "object" || m["items"] === null || Array.isArray(m["items"])) return null;
  // Every items value must be an array of strings — computeTestStatus calls
  // .map on it. Drop malformed entries rather than rejecting the whole file.
  const items = m["items"] as Record<string, unknown>;
  const cleaned: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(items)) {
    if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
      cleaned[key] = value as string[];
    }
  }
  return { runner: m["runner"], report: m["report"], items: cleaned } as TestMapping;
}

// Legacy fixed-depth lookup (`specs/{domain}/SPEC-{abbrev}.tests.json`).
// parseSpecs no longer calls this — mapping files are discovered by
// collectSpecsTree wherever they sit. Kept exported for the SPEC-arch-019
// contract and its tests; do not add new callers.
export function readTestMapping(sddPath: string, abbrev: string, domain: string): TestMapping | null {
  const mappingPath = path.join(sddPath, "specs", domain, `SPEC-${abbrev}.tests.json`);
  let raw: string;
  try {
    raw = fs.readFileSync(mappingPath, "utf8");
  } catch {
    return null;
  }
  return validateTestMapping(raw);
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

  // Mapping keys are matched case-insensitively: item IDs are normalized to
  // uppercase at parse time, while mapping files are hand-authored and may use
  // the natural "SPEC-abc-001" casing.
  let substrings = mapping.items[specItemId];
  if (!substrings) {
    const wanted = specItemId.toUpperCase();
    for (const key of Object.keys(mapping.items)) {
      if (key.toUpperCase() === wanted) {
        substrings = mapping.items[key];
        break;
      }
    }
  }
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

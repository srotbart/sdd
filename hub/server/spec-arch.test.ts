import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// SPEC-arch domain coverage that does not require the full HTTP server import.
// Behavioural tests against the real module boundaries (db, parsers, ws-ui,
// watcher, config constants). HTTP-route tests that need a live server live in
// spec-arch-http.test.ts (separate module-mock graph).

import {
  getDb,
  closeDb,
  insertWorkspace,
  getAllWorkspaces,
  getRecentWorkspaces,
  updateWorkspace,
  upsertAgent,
  getAllAgents,
  computeInitials,
  type Workspace,
} from "./db/index.js";
import { MIGRATIONS, CREATE_AGENTS } from "./db/schema.js";
import {
  parseTargets,
  parseGaps,
  readTestMapping,
  parseVitestReport,
  parseSurefireReports,
  computeTestStatus,
  type TestMapping,
  type ParsedReport,
} from "./sdd-parser.js";

function freshMemoryDb() {
  closeDb();
  process.env["SDD_DB_PATH"] = ":memory:";
  return getDb();
}

function tmpSdd(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

// ---------------------------------------------------------------------------
// SPEC-arch-003 — Persistence is SQLite via better-sqlite3
// ---------------------------------------------------------------------------
describe("SPEC-arch-003: persistence is SQLite via better-sqlite3", () => {
  it("SPEC-arch-003: getDb returns a driver that executes SQLite SQL and persists rows", () => {
    freshMemoryDb();
    insertWorkspace({ id: "ws-sqlite", name: "Repo", path: "/repo-sqlite", description: null });
    // Round-trip through actual SQL proves the better-sqlite3 driver is live.
    const rows = getDb().prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
    const tableNames = rows.map((r) => r.name);
    expect(tableNames).toContain("workspaces");
    expect(tableNames).toContain("agents");
    const ws = getDb().prepare("SELECT id FROM workspaces WHERE id = ?").get("ws-sqlite") as { id: string };
    expect(ws.id).toBe("ws-sqlite");
    closeDb();
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-008 — Server listens on port 22351 (config constant)
// SPEC-arch-007 — Hub binds to 127.0.0.1 only, no auth (config constant)
// ---------------------------------------------------------------------------
describe("SPEC-arch-007/008: hub host and port are fixed config constants", () => {
  const indexSrc = fs.readFileSync(path.join(__dirname, "index.ts"), "utf8");

  it("SPEC-arch-008: server source pins PORT to 22351", () => {
    expect(/const\s+PORT\s*=\s*22351\b/.test(indexSrc)).toBe(true);
  });

  it("SPEC-arch-007: server source binds HOST to 127.0.0.1 only", () => {
    expect(/const\s+HOST\s*=\s*"127\.0\.0\.1"/.test(indexSrc)).toBe(true);
  });

  it("SPEC-arch-007: no authentication middleware token is checked before handling API", () => {
    // No Authorization header / bearer token gate exists anywhere in the handler.
    expect(/authorization|bearer|req\.headers\[["']auth/i.test(indexSrc)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-017 — Vite dev server listens on port 22400 (config constant)
// ---------------------------------------------------------------------------
describe("SPEC-arch-017: Vite dev server port", () => {
  it("SPEC-arch-017: vite.config.ts sets server.port to 22400", () => {
    const viteCfg = fs.readFileSync(
      path.join(__dirname, "..", "client", "vite.config.ts"),
      "utf8"
    );
    expect(/port:\s*22400\b/.test(viteCfg)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-009 — Only one server instance may run at a time (EADDRINUSE → exit)
// ---------------------------------------------------------------------------
describe("SPEC-arch-009: single-instance enforcement", () => {
  it("SPEC-arch-009: index.ts handles EADDRINUSE by printing an error and exiting non-zero", () => {
    const indexSrc = fs.readFileSync(path.join(__dirname, "index.ts"), "utf8");
    expect(indexSrc.includes('err.code === "EADDRINUSE"')).toBe(true);
    expect(/process\.exit\(1\)/.test(indexSrc)).toBe(true);
    expect(/already running/i.test(indexSrc)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-010 — getAllWorkspaces returns all workspace rows from SQLite
// ---------------------------------------------------------------------------
describe("SPEC-arch-010: GET /workspaces underlying store returns all workspaces from SQLite", () => {
  it("SPEC-arch-010: getAllWorkspaces returns every inserted workspace row with id/name/path/created_at", () => {
    freshMemoryDb();
    insertWorkspace({ id: "ws-a", name: "A", path: "/a", description: null });
    insertWorkspace({ id: "ws-b", name: "B", path: "/b", description: "desc" });
    const all = getAllWorkspaces();
    expect(all).toHaveLength(2);
    const a = all.find((w) => w.id === "ws-a") as Workspace;
    expect(a).toMatchObject({ id: "ws-a", name: "A", path: "/a" });
    expect(typeof a.created_at).toBe("string");
    closeDb();
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-011 — updateWorkspace persists partial field changes to SQLite
// ---------------------------------------------------------------------------
describe("SPEC-arch-011: PATCH workspace persists only provided fields to SQLite", () => {
  it("SPEC-arch-011: updateWorkspace changes only the named field, leaving others intact", () => {
    freshMemoryDb();
    insertWorkspace({ id: "ws-p", name: "Old", path: "/orig", description: "d" });
    updateWorkspace("ws-p", { name: "New" });
    const ws = getAllWorkspaces().find((w) => w.id === "ws-p") as Workspace;
    expect(ws.name).toBe("New");
    expect(ws.path).toBe("/orig");
    expect(ws.description).toBe("d");
    closeDb();
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-029 — agents table has name column; getAllAgents returns name+initials
// ---------------------------------------------------------------------------
describe("SPEC-arch-029: agents table name column and getAllAgents name/initials", () => {
  it("SPEC-arch-029: agents schema declares a NOT NULL name column", () => {
    expect(/name\s+TEXT\s+NOT\s+NULL/i.test(CREATE_AGENTS)).toBe(true);
  });

  it("SPEC-arch-029: getAllAgents returns name and computed initials", () => {
    freshMemoryDb();
    insertWorkspace({ id: "ws-ag", name: "R", path: "/r", description: null });
    upsertAgent({ id: "agt-x", workspace_id: "ws-ag", pid: 5, host: "h", status: "idle", name: "claude-a" });
    const agents = getAllAgents();
    expect(agents[0]).toMatchObject({ name: "claude-a", initials: "CA" });
    closeDb();
  });

  it("SPEC-arch-029: empty-name agent row is backfilled with pid@host at read time", () => {
    freshMemoryDb();
    insertWorkspace({ id: "ws-bf", name: "R", path: "/rbf", description: null });
    getDb()
      .prepare("INSERT INTO agents (id, workspace_id, pid, host, status, name) VALUES (?,?,?,?,?,?)")
      .run("agt-empty", "ws-bf", 77, "devbox", "idle", "");
    const agent = getAllAgents().find((a) => a.id === "agt-empty");
    expect(agent?.name).toBe("77@devbox");
    expect(agent?.initials).not.toBe("");
    closeDb();
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-028 — initials derivation (server-side rule from name)
// ---------------------------------------------------------------------------
describe("SPEC-arch-028: agent name initials derivation", () => {
  it("SPEC-arch-028: computeInitials takes first char of up to two words, uppercased", () => {
    expect(computeInitials("claude-a")).toBe("CA");
    expect(computeInitials("sdd worker")).toBe("SW");
    expect(computeInitials("alice")).toBe("A");
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-039 — getRecentWorkspaces returns most recently attached workspaces
// ---------------------------------------------------------------------------
describe("SPEC-arch-039: recent-workspaces store query", () => {
  it("SPEC-arch-039: getRecentWorkspaces returns up to 5 rows newest-first", () => {
    freshMemoryDb();
    for (let i = 0; i < 7; i++) {
      insertWorkspace({ id: `ws-r${i}`, name: `R${i}`, path: `/r${i}`, description: null });
    }
    const recent = getRecentWorkspaces(5);
    expect(recent).toHaveLength(5);
    expect(recent[0].id).toBe("ws-r6");
    closeDb();
  });

  it("SPEC-arch-039: getRecentWorkspaces returns empty array when no workspaces exist", () => {
    freshMemoryDb();
    expect(getRecentWorkspaces(5)).toEqual([]);
    closeDb();
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-035 — parseTargets marks archive-dir targets as 'archived'
// ---------------------------------------------------------------------------
describe("SPEC-arch-035: parseTargets archived status", () => {
  const ARCHIVED_TARGET = `---
id: TGT-900
status: accepted
created: 2026-05-10
domain: architecture
---

# Target: Old feature

## Current statement
Done long ago.
`;
  const ACTIVE_TARGET = `---
id: TGT-901
status: ready
created: 2026-05-11
domain: architecture
---

# Target: New feature

## Current statement
Pending work.
`;

  it("SPEC-arch-035: a target read from targets/archive/ is returned with status 'archived' regardless of frontmatter", () => {
    const root = tmpSdd("sdd-arch035-");
    fs.mkdirSync(path.join(root, "targets", "archive"), { recursive: true });
    fs.writeFileSync(path.join(root, "targets", "archive", "TGT-900.md"), ARCHIVED_TARGET);
    const targets = parseTargets(root);
    expect(targets).toHaveLength(1);
    expect(targets[0].status).toBe("archived");
  });

  it("SPEC-arch-035: an active-dir target keeps its frontmatter status", () => {
    const root = tmpSdd("sdd-arch035b-");
    fs.mkdirSync(path.join(root, "targets"), { recursive: true });
    fs.writeFileSync(path.join(root, "targets", "TGT-901.md"), ACTIVE_TARGET);
    const targets = parseTargets(root);
    expect(targets[0].status).toBe("ready");
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-041 — parseGaps derives domain from spec-item when absent
// ---------------------------------------------------------------------------
describe("SPEC-arch-041: parseGaps domain derivation", () => {
  function gap(specItem: string, withDomain: boolean): string {
    return `---
id: GAP-test-001
spec-item: ${specItem}
${withDomain ? "domain: architecture\n" : ""}status: open
discovered: "2026-05-28T00:00:00Z"
audit-spec-version: "abc123"
closed-by: null
deferred-reason: null
---

# Gap: domain derivation test

**Location:** somewhere.ts:1

**Reasoning:** test.
`;
  }

  it("SPEC-arch-041: derives 'architecture' from SPEC-arch-NNN when domain frontmatter absent", () => {
    const root = tmpSdd("sdd-arch041-");
    fs.mkdirSync(path.join(root, "gaps"), { recursive: true });
    fs.writeFileSync(path.join(root, "gaps", "GAP-test-001.md"), gap("SPEC-arch-005", false));
    expect(parseGaps(root)[0].domain).toBe("architecture");
  });

  it("SPEC-arch-041: derives 'ui-screens' from SPEC-scr-NNN abbrev", () => {
    const root = tmpSdd("sdd-arch041b-");
    fs.mkdirSync(path.join(root, "gaps"), { recursive: true });
    fs.writeFileSync(path.join(root, "gaps", "GAP-test-001.md"), gap("SPEC-scr-023", false));
    expect(parseGaps(root)[0].domain).toBe("ui-screens");
  });

  it("SPEC-arch-041: unknown abbrev falls back to the abbrev itself, never empty string", () => {
    const root = tmpSdd("sdd-arch041c-");
    fs.mkdirSync(path.join(root, "gaps"), { recursive: true });
    fs.writeFileSync(path.join(root, "gaps", "GAP-test-001.md"), gap("SPEC-zzz-001", false));
    const domain = parseGaps(root)[0].domain;
    expect(domain).toBe("zzz");
    expect(domain).not.toBe("");
  });

  it("SPEC-arch-041: explicit domain frontmatter takes precedence over derivation", () => {
    const root = tmpSdd("sdd-arch041d-");
    fs.mkdirSync(path.join(root, "gaps"), { recursive: true });
    fs.writeFileSync(path.join(root, "gaps", "GAP-test-001.md"), gap("SPEC-scr-001", true));
    expect(parseGaps(root)[0].domain).toBe("architecture");
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-019 — test mapping file declares runner, report, items
// ---------------------------------------------------------------------------
describe("SPEC-arch-019: per-spec test mapping file", () => {
  it("SPEC-arch-019: readTestMapping parses runner, report and items from SPEC-{abbrev}.tests.json", () => {
    const root = tmpSdd("sdd-arch019-");
    const domainDir = path.join(root, "specs", "architecture");
    fs.mkdirSync(domainDir, { recursive: true });
    const mapping: TestMapping = {
      runner: "vitest",
      report: "hub/server/report.json",
      items: { "SPEC-arch-005": ["sends snapshot"] },
    };
    fs.writeFileSync(path.join(domainDir, "SPEC-arch.tests.json"), JSON.stringify(mapping));
    const parsed = readTestMapping(root, "arch", "architecture");
    expect(parsed).toMatchObject({ runner: "vitest", report: "hub/server/report.json" });
    expect(parsed?.items["SPEC-arch-005"]).toEqual(["sends snapshot"]);
  });

  it("SPEC-arch-019: returns null when no companion mapping file exists", () => {
    const root = tmpSdd("sdd-arch019b-");
    fs.mkdirSync(path.join(root, "specs", "architecture"), { recursive: true });
    expect(readTestMapping(root, "arch", "architecture")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-020 — vitest JSON report parsing (testResults[*].assertionResults)
// ---------------------------------------------------------------------------
describe("SPEC-arch-020: vitest JSON report parsing", () => {
  it("SPEC-arch-020: walks testResults[*].assertionResults collecting fullName/status and converts startTime to runAt ISO", () => {
    const root = tmpSdd("sdd-arch020-");
    const reportPath = path.join(root, "vitest.json");
    fs.writeFileSync(
      reportPath,
      JSON.stringify({
        startTime: 1700000000000,
        testResults: [
          {
            assertionResults: [
              { fullName: "suite a passes", status: "passed" },
              { fullName: "suite b fails", status: "failed" },
            ],
          },
        ],
      })
    );
    const report = parseVitestReport(reportPath) as ParsedReport;
    expect(report.tests).toHaveLength(2);
    expect(report.tests).toContainEqual({ fullName: "suite a passes", status: "passed" });
    expect(report.tests).toContainEqual({ fullName: "suite b fails", status: "failed" });
    expect(report.runAt).toBe(new Date(1700000000000).toISOString());
  });

  it("SPEC-arch-020: returns null when the report file does not exist", () => {
    expect(parseVitestReport(path.join(os.tmpdir(), "does-not-exist-arch020.json"))).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-021 — Maven Surefire XML report parsing from TEST-*.xml
// ---------------------------------------------------------------------------
describe("SPEC-arch-021: Surefire XML report parsing", () => {
  it("SPEC-arch-021: reads all TEST-*.xml, builds fullName from classname+name, flags <failure> as failed", () => {
    const dir = tmpSdd("sdd-arch021-");
    fs.writeFileSync(
      path.join(dir, "TEST-com.example.FooTest.xml"),
      `<testsuite timestamp="2026-05-01T10:00:00">
         <testcase classname="com.example.FooTest" name="passes"/>
         <testcase classname="com.example.FooTest" name="breaks"><failure>boom</failure></testcase>
       </testsuite>`
    );
    const report = parseSurefireReports(dir) as ParsedReport;
    expect(report.tests).toContainEqual({ fullName: "com.example.FooTest passes", status: "passed" });
    expect(report.tests).toContainEqual({ fullName: "com.example.FooTest breaks", status: "failed" });
    expect(report.runAt).toBe(new Date("2026-05-01T10:00:00").toISOString());
  });

  it("SPEC-arch-021: returns null when the directory has no TEST-*.xml files", () => {
    const dir = tmpSdd("sdd-arch021b-");
    expect(parseSurefireReports(dir)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-022 — testStatus computed as one of four states
// ---------------------------------------------------------------------------
describe("SPEC-arch-022: four-state testStatus computation", () => {
  const report: ParsedReport = {
    runAt: "2026-05-01T00:00:00.000Z",
    tests: [
      { fullName: "SPEC-arch-005 sends snapshot on connect", status: "passed" },
      { fullName: "SPEC-arch-006 agent register fails badly", status: "failed" },
    ],
  };
  const mapping: TestMapping = {
    runner: "vitest",
    report: "r.json",
    items: {
      "SPEC-arch-005": ["sends snapshot"],
      "SPEC-arch-006": ["register fails"],
      "SPEC-arch-007": ["no test substring here"],
    },
  };

  it("SPEC-arch-022: 'not-run' when report is null", () => {
    const result = computeTestStatus("SPEC-arch-005", mapping, null);
    expect(result.status).toBe("not-run");
    expect(result.lastRun).toBeUndefined();
  });

  it("SPEC-arch-022: 'missing' when item has no matching test, with lastRun set", () => {
    const result = computeTestStatus("SPEC-arch-007", mapping, report);
    expect(result.status).toBe("missing");
    expect(result.lastRun).toBe(report.runAt);
  });

  it("SPEC-arch-022: 'passing' when all matched tests passed", () => {
    const result = computeTestStatus("SPEC-arch-005", mapping, report);
    expect(result.status).toBe("passing");
    expect(result.lastRun).toBe(report.runAt);
  });

  it("SPEC-arch-022: 'failing' when at least one matched test failed", () => {
    const result = computeTestStatus("SPEC-arch-006", mapping, report);
    expect(result.status).toBe("failing");
    expect(result.lastRun).toBe(report.runAt);
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-040 — ArtifactStatus union includes 'deferred' and 'abandoned'
// (type-level invariant; assert against the client type source that defines it)
// ---------------------------------------------------------------------------
describe("SPEC-arch-040: ArtifactStatus includes deferred and abandoned", () => {
  it("SPEC-arch-040: ArtifactStatus type union declares both 'deferred' and 'abandoned'", () => {
    const typesSrc = fs.readFileSync(
      path.join(__dirname, "..", "client", "src", "types.ts"),
      "utf8"
    );
    const unionMatch = /export type ArtifactStatus\s*=([\s\S]*?);/.exec(typesSrc);
    expect(unionMatch).not.toBeNull();
    const union = unionMatch![1];
    expect(union).toContain("'deferred'");
    expect(union).toContain("'abandoned'");
  });
});

// ---------------------------------------------------------------------------
// SPEC-arch-004 — chokidar watcher, debounce 150-300ms (config constant)
// ---------------------------------------------------------------------------
describe("SPEC-arch-004: chokidar watcher debounce window", () => {
  const watcherSrc = fs.readFileSync(path.join(__dirname, "watcher.ts"), "utf8");

  it("SPEC-arch-004: watcher imports chokidar", () => {
    expect(/import\s+chokidar\s+from\s+["']chokidar["']/.test(watcherSrc)).toBe(true);
  });

  it("SPEC-arch-004: debounce constant is within the 150-300ms window", () => {
    const m = /DEBOUNCE_MS\s*=\s*(\d+)/.exec(watcherSrc);
    expect(m).not.toBeNull();
    const ms = Number(m![1]);
    expect(ms).toBeGreaterThanOrEqual(150);
    expect(ms).toBeLessThanOrEqual(300);
  });
});

// Sanity: MIGRATIONS export exists and includes both tables (supports 003/029).
describe("SPEC-arch-003: schema migrations", () => {
  it("SPEC-arch-003: MIGRATIONS create workspaces and agents tables", () => {
    const joined = MIGRATIONS.join("\n");
    expect(/CREATE TABLE IF NOT EXISTS workspaces/.test(joined)).toBe(true);
    expect(/CREATE TABLE IF NOT EXISTS agents/.test(joined)).toBe(true);
  });
});

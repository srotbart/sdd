import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseTargets, parseGaps, parseWorkItems, parseSpecs } from "./sdd-parser.js";
import { closeDb, insertWorkspace, getAgentIdsByWorkspace, upsertAgent } from "./db/index.js";
import { getWorkspacesEnriched } from "./workspace-data.js";

function makeSddDir(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-enrich-test-"));
  fs.mkdirSync(path.join(root, ".sdd", "targets", "archive"), { recursive: true });
  fs.mkdirSync(path.join(root, ".sdd", "gaps", "archive"), { recursive: true });
  fs.mkdirSync(path.join(root, ".sdd", "work-items", "archive"), { recursive: true });
  fs.mkdirSync(path.join(root, ".sdd", "specs"), { recursive: true });
  return root;
}

function countFromParsed(sddPath: string) {
  const targets = parseTargets(sddPath);
  const gaps = parseGaps(sddPath);
  const workItems = parseWorkItems(sddPath);
  const specs = parseSpecs(sddPath);
  const today = new Date().toISOString().slice(0, 10);
  return {
    targetsAwaitingUser: targets.filter((t) => t.status === "awaiting-user").length,
    targetsAwaitingAgent: targets.filter((t) => t.status === "awaiting-agent").length,
    targetsReady: targets.filter((t) => t.status === "ready").length,
    targetsDraft: targets.filter((t) => t.status === "draft").length,
    specs: specs.length,
    specItems: specs.reduce((sum, s) => sum + s.items.filter((i) => i.status === "active").length, 0),
    openGaps: gaps.filter((g) => g.status === "open").length,
    workPending: workItems.filter((w) => w.status === "pending").length,
    workInProgress: workItems.filter((w) => w.status === "in-progress").length,
    workBlocked: workItems.filter((w) => w.status === "blocked").length,
    workDoneToday: workItems.filter((w) => w.status === "done" && w.closed?.startsWith(today)).length,
  };
}

let tmpRoot: string;

beforeEach(() => {
  process.env["SDD_DB_PATH"] = ":memory:";
  tmpRoot = makeSddDir();
});

afterEach(() => {
  closeDb();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

describe("workspace enrichment counts", () => {
  it("workspace with no .sdd files returns zero counts for all 12 fields", () => {
    const sddPath = path.join(tmpRoot, ".sdd");
    const counts = countFromParsed(sddPath);
    expect(counts).toEqual({
      targetsAwaitingUser: 0,
      targetsAwaitingAgent: 0,
      targetsReady: 0,
      targetsDraft: 0,
      specs: 0,
      specItems: 0,
      openGaps: 0,
      workPending: 0,
      workInProgress: 0,
      workBlocked: 0,
      workDoneToday: 0,
    });
  });

  it("correctly counts targetsAwaitingUser from .sdd/targets", () => {
    const sddPath = path.join(tmpRoot, ".sdd");
    fs.writeFileSync(path.join(sddPath, "targets", "TGT-001.md"), `---
id: TGT-001
status: awaiting-user
created: 2026-05-19
domain: arch
---
# Target: T1
## Current statement
S1.
`);
    fs.writeFileSync(path.join(sddPath, "targets", "TGT-002.md"), `---
id: TGT-002
status: ready
created: 2026-05-19
domain: arch
---
# Target: T2
## Current statement
S2.
`);
    const counts = countFromParsed(sddPath);
    expect(counts.targetsAwaitingUser).toBe(1);
  });

  it("correctly counts openGaps from .sdd/gaps", () => {
    const sddPath = path.join(tmpRoot, ".sdd");
    fs.writeFileSync(path.join(sddPath, "gaps", "GAP-arch-001.md"), `---
id: GAP-arch-001
spec-item: SPEC-arch-001
domain: architecture
status: open
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "abc"
closed-by: null
deferred-reason: null
---
# Gap: Missing foo
**Location:** \`foo.ts:1\`
**Reasoning:** foo is missing.
`);
    fs.writeFileSync(path.join(sddPath, "gaps", "GAP-arch-002.md"), `---
id: GAP-arch-002
spec-item: SPEC-arch-002
domain: architecture
status: closed
discovered: 2026-05-19T00:00:00Z
audit-spec-version: "abc"
closed-by: WI-arch-001
deferred-reason: null
---
# Gap: Fixed bar
**Location:** \`bar.ts:2\`
**Reasoning:** bar was missing.
`);
    const counts = countFromParsed(sddPath);
    expect(counts.openGaps).toBe(1);
  });

  it("correctly counts workInProgress and workBlocked from .sdd/work-items", () => {
    const sddPath = path.join(tmpRoot, ".sdd");
    fs.writeFileSync(path.join(sddPath, "work-items", "WI-arch-001.md"), `---
id: WI-arch-001
gap-id: GAP-arch-001
domain: architecture
status: in-progress
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---
# Work Item: Do something
**Scope:** \`foo.ts\`
**Acceptance criteria:**
- Does it
`);
    fs.writeFileSync(path.join(sddPath, "work-items", "WI-arch-002.md"), `---
id: WI-arch-002
gap-id: GAP-arch-002
domain: architecture
status: blocked
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---
# Work Item: Blocked thing
**Scope:** \`bar.ts\`
**Acceptance criteria:**
- Does it
`);
    fs.writeFileSync(path.join(sddPath, "work-items", "WI-arch-003.md"), `---
id: WI-arch-003
gap-id: GAP-arch-003
domain: architecture
status: done
created: 2026-05-19T00:00:00Z
abandoned-reason: null
---
# Work Item: Done thing
**Scope:** \`baz.ts\`
**Acceptance criteria:**
- Does it
`);
    const counts = countFromParsed(sddPath);
    expect(counts.workInProgress).toBe(1);
    expect(counts.workBlocked).toBe(1);
  });
});

describe("workspace enrichment counts — new 12-field fields", () => {
  it("counts targetsAwaitingAgent, targetsReady, targetsDraft from .sdd/targets", () => {
    const sddPath = path.join(tmpRoot, ".sdd");
    const statuses = ["awaiting-agent", "ready", "draft", "ready"];
    statuses.forEach((status, i) => {
      fs.writeFileSync(path.join(sddPath, "targets", `TGT-00${i + 1}.md`), `---
id: TGT-00${i + 1}
status: ${status}
created: 2026-05-20
domain: arch
---
# Target: T${i + 1}
## Current statement
S${i + 1}.
`);
    });
    const counts = countFromParsed(sddPath);
    expect(counts.targetsAwaitingAgent).toBe(1);
    expect(counts.targetsReady).toBe(2);
    expect(counts.targetsDraft).toBe(1);
  });

  it("counts specs and specItems from .sdd/specs", () => {
    const sddPath = path.join(tmpRoot, ".sdd");
    fs.mkdirSync(path.join(sddPath, "specs", "architecture"), { recursive: true });
    fs.writeFileSync(path.join(sddPath, "specs", "architecture", "SPEC-arch-001.md"), `---\nid: SPEC-arch-001\ndomain: architecture\nabbrev: arch\nstatus: active\naliases: []\nversion: "abc123"\n---\n\n# SPEC-arch-001 — Item one\n\nBody text.\n`);
    fs.writeFileSync(path.join(sddPath, "specs", "architecture", "SPEC-arch-002.md"), `---\nid: SPEC-arch-002\ndomain: architecture\nabbrev: arch\nstatus: deprecated\naliases: []\nversion: "abc456"\n---\n\n# SPEC-arch-002 — Item two\n\nBody text.\n`);
    const counts = countFromParsed(sddPath);
    expect(counts.specs).toBe(1);
    expect(counts.specItems).toBe(1);
  });

  it("counts workPending and workDoneToday from .sdd/work-items", () => {
    const sddPath = path.join(tmpRoot, ".sdd");
    const today = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(path.join(sddPath, "work-items", "WI-arch-001.md"), `---
id: WI-arch-001
gap-id: GAP-arch-001
domain: architecture
status: pending
created: 2026-05-20T00:00:00Z
abandoned-reason: null
---
# Work Item: Pending thing
**Scope:** \`foo.ts\`
**Acceptance criteria:**
- Does it
`);
    fs.writeFileSync(path.join(sddPath, "work-items", "WI-arch-002.md"), `---
id: WI-arch-002
gap-id: GAP-arch-002
domain: architecture
status: done
created: 2026-05-20T00:00:00Z
closed: ${today}T08:00:00Z
abandoned-reason: null
---
# Work Item: Done today
**Scope:** \`bar.ts\`
**Acceptance criteria:**
- Does it
`);
    fs.writeFileSync(path.join(sddPath, "work-items", "WI-arch-003.md"), `---
id: WI-arch-003
gap-id: GAP-arch-003
domain: architecture
status: done
created: 2026-04-01T00:00:00Z
closed: 2026-04-01
abandoned-reason: null
---
# Work Item: Done yesterday
**Scope:** \`baz.ts\`
**Acceptance criteria:**
- Does it
`);
    const counts = countFromParsed(sddPath);
    expect(counts.workPending).toBe(1);
    expect(counts.workDoneToday).toBe(1);
  });

  it("getWorkspacesEnriched returns WorkspaceData with all 12 count fields for a registered workspace", () => {
    insertWorkspace({ id: "ws-enrich-1", name: "TestRepo", path: tmpRoot, description: null });
    const enriched = getWorkspacesEnriched();
    expect(enriched).toHaveLength(1);
    const { counts } = enriched[0];
    expect(Object.keys(counts)).toEqual(expect.arrayContaining([
      "targetsAwaitingUser", "targetsAwaitingAgent", "targetsReady", "targetsDraft",
      "specs", "specItems", "openGaps", "staleAuditDomains",
      "workPending", "workInProgress", "workBlocked", "workDoneToday",
    ]));
    expect(typeof counts.staleAuditDomains).toBe("number");
  });
});

describe("getAgentIdsByWorkspace", () => {
  it("returns empty map when no agents are registered", () => {
    insertWorkspace({ id: "ws-1", name: "Repo", path: tmpRoot, description: null });
    const map = getAgentIdsByWorkspace();
    expect(map.get("ws-1") ?? []).toEqual([]);
  });

  it("returns agent IDs grouped by workspace", () => {
    insertWorkspace({ id: "ws-1", name: "Repo", path: tmpRoot, description: null });
    upsertAgent({ id: "agt-1", workspace_id: "ws-1", pid: 1, host: "h", status: "idle", name: "a1" });
    upsertAgent({ id: "agt-2", workspace_id: "ws-1", pid: 2, host: "h", status: "busy", name: "a2" });
    const map = getAgentIdsByWorkspace();
    expect(map.get("ws-1")).toEqual(expect.arrayContaining(["agt-1", "agt-2"]));
    expect(map.get("ws-1")).toHaveLength(2);
  });
});

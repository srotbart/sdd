import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseTargets, parseGaps, parseWorkItems } from "./sdd-parser.js";

function makeSddDir(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-test-"));
  fs.mkdirSync(path.join(root, "targets"), { recursive: true });
  fs.mkdirSync(path.join(root, "targets", "archive"), { recursive: true });
  return root;
}

const ACTIVE_TARGET = `---
id: TGT-001
status: awaiting-agent
created: 2026-05-17
domain: ui-screens
---

# Target: Foo screen

## Current statement
Show the list of targets loaded from .sdd.

## Dialog
### 2026-05-17 — User
I want this feature.
`;

const ARCHIVED_TARGET = `---
id: TGT-002
status: accepted
created: 2026-05-10
domain: architecture
---

# Target: Old feature

## Current statement
This was accepted long ago.
`;

const MULTIPARAGRAPH_TARGET = `---
id: TGT-004
status: ready
created: 2026-05-20
domain: architecture
---

# Target: Rich statement

## Current statement

First paragraph introduces the intent.

A second paragraph with a list:
- item one
- item two

Final paragraph states the **last decision** to settle.

## Dialog
### 2026-05-20 — User
Dialog content that must not leak into the statement.
`;

function makeGapsSddDir(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-gaps-test-"));
  fs.mkdirSync(path.join(root, "gaps"), { recursive: true });
  fs.mkdirSync(path.join(root, "gaps", "archive"), { recursive: true });
  return root;
}

const OPEN_GAP = `---
id: GAP-arch-018
spec-item: SPEC-arch-015
domain: architecture
status: open
discovered: "2026-05-17T00:00:00Z"
audit-spec-version: "b44a9deb"
closed-by: null
deferred-reason: null
---

# Gap: GET /workspaces/:id/gaps endpoint not implemented

**Location:** hub/server/index.ts — no route handler for GET /workspaces/:id/gaps

**Reasoning:** The handleApi function has no regex match or route handler for the /workspaces/:id/gaps path.
`;

const CLOSED_GAP = `---
id: GAP-arch-001
spec-item: SPEC-arch-001
domain: architecture
status: closed
discovered: "2026-05-15T00:00:00Z"
audit-spec-version: "1d0b7d02"
closed-by: WI-arch-001
deferred-reason: null
---

# Gap: Node.js server does not exist

**Location:** not yet implemented — no server entry point found in codebase

**Reasoning:** No code paths found for this item; the Node.js hub server has not been created.
`;

describe("parseGaps", () => {
  it("returns empty array when gaps directory does not exist", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-gaps-test-"));
    expect(parseGaps(root)).toEqual([]);
  });

  it("returns empty array when gaps directory is empty", () => {
    const root = makeGapsSddDir();
    expect(parseGaps(root)).toEqual([]);
  });

  it("parses an open gap file's frontmatter and body fields correctly", () => {
    const root = makeGapsSddDir();
    fs.writeFileSync(path.join(root, "gaps", "GAP-arch-018.md"), OPEN_GAP);

    const gaps = parseGaps(root);
    expect(gaps).toHaveLength(1);
    expect(gaps[0]).toMatchObject({
      id: "GAP-arch-018",
      specItem: "SPEC-arch-015",
      domain: "architecture",
      status: "open",
      discovered: "2026-05-17T00:00:00Z",
      auditVersion: "b44a9deb",
      closedBy: null,
      deferredReason: null,
      title: "GET /workspaces/:id/gaps endpoint not implemented",
      location: "hub/server/index.ts — no route handler for GET /workspaces/:id/gaps",
    });
  });

  it("includes gaps from archive directory alongside active gaps", () => {
    const root = makeGapsSddDir();
    fs.writeFileSync(path.join(root, "gaps", "GAP-arch-018.md"), OPEN_GAP);
    fs.writeFileSync(path.join(root, "gaps", "archive", "GAP-arch-001.md"), CLOSED_GAP);

    const gaps = parseGaps(root);
    expect(gaps).toHaveLength(2);
    const ids = gaps.map((g) => g.id).sort();
    expect(ids).toEqual(["GAP-arch-001", "GAP-arch-018"]);
  });

  it("parses closed-by field correctly for archived gaps", () => {
    const root = makeGapsSddDir();
    fs.writeFileSync(path.join(root, "gaps", "archive", "GAP-arch-001.md"), CLOSED_GAP);

    const gaps = parseGaps(root);
    expect(gaps).toHaveLength(1);
    expect(gaps[0]).toMatchObject({
      id: "GAP-arch-001",
      status: "closed",
      closedBy: "WI-arch-001",
    });
  });

  it("returns only active gaps when archive directory does not exist", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-gaps-test-"));
    fs.mkdirSync(path.join(root, "gaps"), { recursive: true });
    fs.writeFileSync(path.join(root, "gaps", "GAP-arch-018.md"), OPEN_GAP);

    const gaps = parseGaps(root);
    expect(gaps).toHaveLength(1);
    expect(gaps[0]?.id).toBe("GAP-arch-018");
  });

  it("derives domain from spec-item when domain frontmatter is absent — arch → architecture", () => {
    const root = makeGapsSddDir();
    const gapNoDomain = `---
id: GAP-arch-099
spec-item: SPEC-arch-001
status: open
discovered: "2026-05-28T00:00:00Z"
audit-spec-version: "abc123"
closed-by: null
deferred-reason: null
---

# Gap: Missing domain field

**Location:** hub/server/index.ts:1

**Reasoning:** Test gap without domain field.
`;
    fs.writeFileSync(path.join(root, "gaps", "GAP-arch-099.md"), gapNoDomain);
    const gaps = parseGaps(root);
    expect(gaps[0]?.domain).toBe("architecture");
  });

  it("derives domain from spec-item when domain frontmatter is absent — scr → ui-screens", () => {
    const root = makeGapsSddDir();
    const gapNoDomain = `---
id: GAP-scr-099
spec-item: SPEC-scr-023
status: open
discovered: "2026-05-28T00:00:00Z"
audit-spec-version: "abc123"
closed-by: null
deferred-reason: null
---

# Gap: Missing domain field

**Location:** hub/client/src/screens/Foo.tsx:1

**Reasoning:** Test gap without domain field.
`;
    fs.writeFileSync(path.join(root, "gaps", "GAP-scr-099.md"), gapNoDomain);
    const gaps = parseGaps(root);
    expect(gaps[0]?.domain).toBe("ui-screens");
  });

  it("uses explicit domain field when present, ignoring spec-item derivation", () => {
    const root = makeGapsSddDir();
    fs.writeFileSync(path.join(root, "gaps", "GAP-arch-018.md"), OPEN_GAP);
    const gaps = parseGaps(root);
    expect(gaps[0]?.domain).toBe("architecture");
  });

  it("domain is never empty string — falls back to abbrev when abbrev is unrecognised", () => {
    const root = makeGapsSddDir();
    const gapUnknownAbbrev = `---
id: GAP-xyz-001
spec-item: SPEC-xyz-001
status: open
discovered: "2026-05-28T00:00:00Z"
audit-spec-version: "abc123"
closed-by: null
deferred-reason: null
---

# Gap: Unknown abbrev

**Location:** somewhere.ts:1

**Reasoning:** Test gap with unknown abbrev.
`;
    fs.writeFileSync(path.join(root, "gaps", "GAP-xyz-001.md"), gapUnknownAbbrev);
    const gaps = parseGaps(root);
    expect(gaps[0]?.domain).not.toBe("");
    expect(gaps[0]?.domain).toBe("xyz");
  });
});

function makeWorkItemsSddDir(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-wi-test-"));
  fs.mkdirSync(path.join(root, "work-items"), { recursive: true });
  fs.mkdirSync(path.join(root, "work-items", "archive"), { recursive: true });
  return root;
}

const PENDING_WORK_ITEM = `---
id: WI-arch-015
gap-id: GAP-arch-018
domain: architecture
status: pending
created: "2026-05-17T00:00:00Z"
abandoned-reason: null
---

# Work Item: Implement GET /workspaces/:id/gaps endpoint

**Scope:** \`hub/server/sdd-parser.ts\` — add parseGaps function

**Acceptance criteria:**
- parseGaps reads all GAP-*.md files from both directories
- Route handler returns 404 for unknown workspace id
- Unit test: parseGaps correctly parses frontmatter and body fields
`;

const DONE_WORK_ITEM = `---
id: WI-arch-001
gap-id: GAP-arch-001
domain: architecture
status: done
created: "2026-05-15T00:00:00Z"
abandoned-reason: null
---

# Work Item: Create Node.js server entry point

**Scope:** \`hub/server/index.ts\` — create the server

**Acceptance criteria:**
- Server starts on port 22351
- Test: server responds on port 22351
`;

describe("parseWorkItems", () => {
  it("returns empty array when work-items directory does not exist", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-wi-test-"));
    expect(parseWorkItems(root)).toEqual([]);
  });

  it("returns empty array when work-items directory is empty", () => {
    const root = makeWorkItemsSddDir();
    expect(parseWorkItems(root)).toEqual([]);
  });

  it("parses a work item's frontmatter and body fields correctly including acceptance criteria bullets", () => {
    const root = makeWorkItemsSddDir();
    fs.writeFileSync(path.join(root, "work-items", "WI-arch-015.md"), PENDING_WORK_ITEM);

    const items = parseWorkItems(root);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      id: "WI-arch-015",
      gapId: "GAP-arch-018",
      domain: "architecture",
      status: "pending",
      created: "2026-05-17T00:00:00Z",
      abandonedReason: null,
      title: "Implement GET /workspaces/:id/gaps endpoint",
      scope: "`hub/server/sdd-parser.ts` — add parseGaps function",
    });
    expect(items[0]?.acceptance).toHaveLength(3);
    expect(items[0]?.acceptance[0]).toBe("parseGaps reads all GAP-*.md files from both directories");
  });

  it("returns results from both active and archive directories", () => {
    const root = makeWorkItemsSddDir();
    fs.writeFileSync(path.join(root, "work-items", "WI-arch-015.md"), PENDING_WORK_ITEM);
    fs.writeFileSync(path.join(root, "work-items", "archive", "WI-arch-001.md"), DONE_WORK_ITEM);

    const items = parseWorkItems(root);
    expect(items).toHaveLength(2);
    const ids = items.map((i) => i.id).sort();
    expect(ids).toEqual(["WI-arch-001", "WI-arch-015"]);
  });

  it("returns only active work items when archive directory does not exist", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-wi-test-"));
    fs.mkdirSync(path.join(root, "work-items"), { recursive: true });
    fs.writeFileSync(path.join(root, "work-items", "WI-arch-015.md"), PENDING_WORK_ITEM);

    const items = parseWorkItems(root);
    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe("WI-arch-015");
  });
});

describe("parseTargets", () => {
  it("returns empty array when targets directory does not exist", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-test-"));
    expect(parseTargets(root)).toEqual([]);
  });

  it("returns empty array when targets directory is empty", () => {
    const root = makeSddDir();
    expect(parseTargets(root)).toEqual([]);
  });

  it("parses an active target file correctly", () => {
    const root = makeSddDir();
    fs.writeFileSync(path.join(root, "targets", "TGT-001.md"), ACTIVE_TARGET);

    const targets = parseTargets(root);
    expect(targets).toHaveLength(1);
    expect(targets[0]).toMatchObject({
      id: "TGT-001",
      status: "awaiting-agent",
      created: "2026-05-17",
      domain: "ui-screens",
      statement: "Show the list of targets loaded from .sdd.",
    });
  });

  it("captures a multi-paragraph Current statement in full, not just the first line (GAP-arch-043)", () => {
    const root = makeSddDir();
    fs.writeFileSync(path.join(root, "targets", "TGT-004.md"), MULTIPARAGRAPH_TARGET);

    const targets = parseTargets(root);
    expect(targets).toHaveLength(1);
    const statement = targets[0]!.statement;
    // Full statement preserved across paragraphs/list…
    expect(statement).toContain("First paragraph introduces the intent.");
    expect(statement).toContain("- item two");
    expect(statement).toContain("Final paragraph states the **last decision** to settle.");
    // …and stops at the next `## ` heading without absorbing the dialog.
    expect(statement).not.toContain("Dialog content that must not leak");
  });

  it("includes archive targets alongside active targets", () => {
    const root = makeSddDir();
    fs.writeFileSync(path.join(root, "targets", "TGT-001.md"), ACTIVE_TARGET);
    fs.writeFileSync(path.join(root, "targets", "archive", "TGT-002.md"), ARCHIVED_TARGET);

    const targets = parseTargets(root);
    expect(targets).toHaveLength(2);
    const ids = targets.map((t) => t.id).sort();
    expect(ids).toEqual(["TGT-001", "TGT-002"]);
  });

  it("returns active and archived targets when multiple exist", () => {
    const root = makeSddDir();
    const target3 = ACTIVE_TARGET.replace("TGT-001", "TGT-003").replace("ui-screens", "architecture");
    fs.writeFileSync(path.join(root, "targets", "TGT-001.md"), ACTIVE_TARGET);
    fs.writeFileSync(path.join(root, "targets", "TGT-003.md"), target3);
    fs.writeFileSync(path.join(root, "targets", "archive", "TGT-002.md"), ARCHIVED_TARGET);

    const targets = parseTargets(root);
    expect(targets).toHaveLength(3);
    const ids = targets.map((t) => t.id).sort();
    expect(ids).toEqual(["TGT-001", "TGT-002", "TGT-003"]);
  });

  it("returns only active targets when archive directory does not exist", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-test-"));
    fs.mkdirSync(path.join(root, "targets"), { recursive: true });
    fs.writeFileSync(path.join(root, "targets", "TGT-001.md"), ACTIVE_TARGET);

    const targets = parseTargets(root);
    expect(targets).toHaveLength(1);
    expect(targets[0]?.id).toBe("TGT-001");
  });

  it("target in archive directory has status overridden to 'archived' regardless of frontmatter", () => {
    const root = makeSddDir();
    fs.writeFileSync(path.join(root, "targets", "archive", "TGT-002.md"), ARCHIVED_TARGET);

    const targets = parseTargets(root);
    expect(targets).toHaveLength(1);
    expect(targets[0]).toMatchObject({
      id: "TGT-002",
      status: "archived",
      created: "2026-05-10",
      domain: "architecture",
      statement: "This was accepted long ago.",
    });
  });

  it("target in active directory retains its frontmatter status unchanged", () => {
    const root = makeSddDir();
    fs.writeFileSync(path.join(root, "targets", "TGT-001.md"), ACTIVE_TARGET);

    const targets = parseTargets(root);
    expect(targets).toHaveLength(1);
    expect(targets[0]?.status).toBe("awaiting-agent");
  });

  it("archive directory target with any frontmatter status is returned as 'archived'", () => {
    const root = makeSddDir();
    const readyTarget = ARCHIVED_TARGET.replace("status: accepted", "status: ready").replace("TGT-002", "TGT-009");
    fs.writeFileSync(path.join(root, "targets", "archive", "TGT-009.md"), readyTarget);

    const targets = parseTargets(root);
    expect(targets[0]?.status).toBe("archived");
  });
});

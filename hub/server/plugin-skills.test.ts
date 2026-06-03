import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

vi.mock("./watcher.js", () => ({
  startWatcher: vi.fn(() => vi.fn()),
}));

vi.mock("./ws-ui.js", () => ({
  attachUiWebSocketServer: vi.fn(),
  broadcastUpdate: vi.fn(),
  broadcastSddChanged: vi.fn(),
  broadcastRaw: vi.fn(),
}));

vi.mock("./ws-agent.js", () => ({
  attachAgentWebSocketServer: vi.fn(),
}));

vi.mock("./sdd-artifact.js", () => ({
  resolveArtifact: vi.fn(() => null),
}));

vi.mock("./sdd-parser.js", () => ({
  parseTargets: vi.fn(() => []),
  parseGaps: vi.fn(() => []),
  parseWorkItems: vi.fn(() => []),
  parseSpecs: vi.fn(() => []),
}));

const dbMocks = {
  getDb: vi.fn(),
  getAllWorkspaces: vi.fn(() => []),
  getWorkspaceById: vi.fn(),
  updateWorkspace: vi.fn(),
  insertWorkspace: vi.fn(),
  getRecentWorkspaces: vi.fn(() => []),
  getAgentIdsByWorkspace: vi.fn(() => new Map()),
  getAllAgents: vi.fn(() => []),
  upsertAgent: vi.fn(),
  updateAgentHeartbeat: vi.fn(),
  updateAgentStatus: vi.fn(),
  deleteAgent: vi.fn(),
  computeInitials: vi.fn((n: string) => n[0]?.toUpperCase() ?? ""),
};

vi.mock("./db/index.js", () => dbMocks);

vi.mock("./workspace-data.js", () => ({
  getWorkspacesEnriched: vi.fn(() => []),
}));

const { server, getPluginSkills } = await import("./index.js");

function startServer(): Promise<number> {
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as { port: number };
      resolve(addr.port);
    });
  });
}

function stopServer(): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

let tmpRoot: string;
let port: number;
let originalHomedir: typeof os.homedir;

beforeEach(async () => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-skills-test-"));
  port = await startServer();
  originalHomedir = os.homedir;
  (os as { homedir: typeof os.homedir }).homedir = () => tmpRoot;
});

afterEach(async () => {
  await stopServer();
  fs.rmSync(tmpRoot, { recursive: true, force: true });
  (os as { homedir: typeof os.homedir }).homedir = originalHomedir;
});

function makeSkillFile(pluginRoot: string, version: string, skillName: string, name: string, description: string): void {
  const skillDir = path.join(pluginRoot, version, "skills", skillName);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, "SKILL.md"), `---\nname: ${name}\ndescription: ${description}\nversion: 0.1.0\n---\n\n# Skill content\n`);
}

describe("GET /plugin-skills — SPEC-scr-044", () => {
  it("returns empty array when plugin cache directory does not exist", async () => {
    const res = await fetch(`http://127.0.0.1:${port}/plugin-skills`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([]);
  });

  it("returns skills sorted by name from the highest semver version", async () => {
    const pluginRoot = path.join(tmpRoot, ".claude", "plugins", "cache", "sdd", "sdd");
    makeSkillFile(pluginRoot, "0.1.0", "spec-audit", "spec-audit", "Audit the spec.");
    makeSkillFile(pluginRoot, "0.1.0", "session-start", "session-start", "Show SDD state.");
    makeSkillFile(pluginRoot, "0.1.1", "spec-audit", "spec-audit", "Audit the spec v2.");
    makeSkillFile(pluginRoot, "0.1.1", "work-item-close", "work-item-close", "Close a work item.");

    const res = await fetch(`http://127.0.0.1:${port}/plugin-skills`);
    expect(res.status).toBe(200);
    const body = await res.json() as { name: string; description: string }[];
    const names = body.map((s) => s.name);
    expect(names).toEqual(["spec-audit", "work-item-close"]);
    expect(body[0].description).toBe("Audit the spec v2.");
    expect(body[1].description).toBe("Close a work item.");
  });

  it("returns skills in ascending name order", async () => {
    const pluginRoot = path.join(tmpRoot, ".claude", "plugins", "cache", "sdd", "sdd");
    makeSkillFile(pluginRoot, "0.1.0", "z-skill", "z-skill", "Last skill.");
    makeSkillFile(pluginRoot, "0.1.0", "a-skill", "a-skill", "First skill.");
    makeSkillFile(pluginRoot, "0.1.0", "m-skill", "m-skill", "Middle skill.");

    const res = await fetch(`http://127.0.0.1:${port}/plugin-skills`);
    expect(res.status).toBe(200);
    const body = await res.json() as { name: string; description: string }[];
    const names = body.map((s) => s.name);
    expect(names).toEqual(["a-skill", "m-skill", "z-skill"]);
  });
});

describe("getPluginSkills — unit", () => {
  it("returns empty array when no plugin cache exists", () => {
    const result = getPluginSkills();
    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([]);
  });

  it("picks the highest semver version when multiple exist", () => {
    const pluginRoot = path.join(tmpRoot, ".claude", "plugins", "cache", "sdd", "sdd");
    makeSkillFile(pluginRoot, "0.1.0", "my-skill", "my-skill", "Old desc.");
    makeSkillFile(pluginRoot, "0.1.9", "my-skill", "my-skill", "New desc.");
    makeSkillFile(pluginRoot, "0.1.10", "my-skill", "my-skill", "Newest desc.");

    const result = getPluginSkills();
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe("Newest desc.");
  });
});

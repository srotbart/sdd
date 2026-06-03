import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./watcher.js", () => ({
  startWatcher: vi.fn(() => vi.fn()),
}));

vi.mock("./db/index.js", () => ({
  getDb: vi.fn(),
  getAllWorkspaces: vi.fn(() => []),
  getWorkspaceById: vi.fn(),
  updateWorkspace: vi.fn(),
  insertWorkspace: vi.fn(),
  getAgentIdsByWorkspace: vi.fn(() => new Map()),
  getAllAgents: vi.fn(() => []),
  upsertAgent: vi.fn(),
  updateAgentHeartbeat: vi.fn(),
  updateAgentStatus: vi.fn(),
  deleteAgent: vi.fn(),
  computeInitials: vi.fn((n: string) => n[0]?.toUpperCase() ?? ""),
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

vi.mock("./sdd-parser.js", () => ({
  parseTargets: vi.fn(() => []),
  parseGaps: vi.fn(() => []),
  parseWorkItems: vi.fn(() => []),
  parseSpecs: vi.fn(() => []),
}));

vi.mock("./sdd-artifact.js", () => ({
  resolveArtifact: vi.fn(() => null),
}));

const { startWatcher } = await import("./watcher.js");
const { watcherRegistry, swapWatcher } = await import("./index.js");

beforeEach(() => {
  watcherRegistry.clear();
  vi.mocked(startWatcher).mockClear();
  vi.mocked(startWatcher).mockImplementation(() => vi.fn());
});

describe("swapWatcher", () => {
  it("calls old cleanup when swapping to a new path", () => {
    const oldCleanup = vi.fn();
    watcherRegistry.set("ws-1", oldCleanup);

    swapWatcher("ws-1", "/new/path", vi.fn(), vi.fn());

    expect(oldCleanup).toHaveBeenCalledOnce();
  });

  it("starts a new watcher for the new path", () => {
    watcherRegistry.set("ws-1", vi.fn());

    swapWatcher("ws-1", "/new/path", vi.fn(), vi.fn());

    expect(startWatcher).toHaveBeenCalledWith("/new/path", expect.any(Function), expect.any(Function));
  });

  it("stores the new cleanup in the registry", () => {
    const newCleanup = vi.fn();
    vi.mocked(startWatcher).mockReturnValueOnce(newCleanup);
    watcherRegistry.set("ws-1", vi.fn());

    swapWatcher("ws-1", "/new/path", vi.fn(), vi.fn());

    expect(watcherRegistry.get("ws-1")).toBe(newCleanup);
  });

  it("does not call any cleanup when no existing watcher is registered", () => {
    expect(() => {
      swapWatcher("ws-new", "/some/path", vi.fn(), vi.fn());
    }).not.toThrow();
    expect(startWatcher).toHaveBeenCalledOnce();
  });
});

describe("watcherRegistry — PATCH path change", () => {
  it("registry entry is replaced when path changes", () => {
    const firstCleanup = vi.fn();
    const secondCleanup = vi.fn();
    vi.mocked(startWatcher)
      .mockReturnValueOnce(firstCleanup)
      .mockReturnValueOnce(secondCleanup);

    swapWatcher("ws-1", "/path-a", vi.fn(), vi.fn());
    swapWatcher("ws-1", "/path-b", vi.fn(), vi.fn());

    expect(firstCleanup).toHaveBeenCalledOnce();
    expect(watcherRegistry.get("ws-1")).toBe(secondCleanup);
  });

  it("registry entry is untouched when path does not change (no swapWatcher called)", () => {
    const cleanup = vi.fn();
    watcherRegistry.set("ws-1", cleanup);

    expect(watcherRegistry.get("ws-1")).toBe(cleanup);
    expect(cleanup).not.toHaveBeenCalled();
  });
});

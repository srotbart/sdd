import { describe, it, expect, vi } from "vitest";
import type { WorkspaceData } from "./workspace-data.js";

const mockCounts = {
  targetsAwaitingUser: 1, targetsAwaitingAgent: 0, targetsReady: 2, targetsDraft: 0,
  specs: 3, specItems: 10, openGaps: 2, staleAuditDomains: 0,
  workPending: 1, workInProgress: 1, workBlocked: 0, workDoneToday: 0,
};

const mockEnriched: WorkspaceData[] = [
  {
    id: "ws-snap-1", name: "Repo", path: "/repo", description: null,
    created_at: "2026-05-20T00:00:00Z",
    counts: mockCounts,
    agents: ["agt-1"],
    lastActivity: "2026-05-20T08:00:00Z",
  },
];

vi.mock("./workspace-data.js", () => ({
  getWorkspacesEnriched: () => mockEnriched,
}));

vi.mock("./db/index.js", () => ({
  getAllAgents: () => [],
}));

describe("ws-ui snapshot includes enriched WorkspaceData (SPEC-arch-036)", () => {
  it("StateSnapshot type carries WorkspaceData[] with counts field (compile-time shape)", () => {
    const snapshot: import("./ws-ui.js").StateSnapshot = {
      type: "snapshot",
      workspaces: mockEnriched,
      agents: [],
    };
    expect(snapshot.workspaces[0].counts.targetsAwaitingUser).toBe(1);
    expect(snapshot.workspaces[0].counts.specItems).toBe(10);
    expect(snapshot.workspaces[0].counts.workDoneToday).toBe(0);
    expect(snapshot.workspaces[0].agents).toEqual(["agt-1"]);
    expect(snapshot.workspaces[0].lastActivity).toBe("2026-05-20T08:00:00Z");
  });

  it("UpdateMessage type carries WorkspaceData[] with all 12 count fields (compile-time shape)", () => {
    const update: import("./ws-ui.js").UpdateMessage = {
      type: "update",
      changedPath: "/repo/.sdd/targets/TGT-001.md",
      workspaces: mockEnriched,
      agents: [],
    };
    const keys = Object.keys(update.workspaces[0].counts);
    expect(keys).toContain("staleAuditDomains");
    expect(keys).toContain("workPending");
    expect(keys).toContain("workDoneToday");
    expect(keys).toHaveLength(12);
  });
});

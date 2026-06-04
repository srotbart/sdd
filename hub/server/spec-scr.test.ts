import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { startWatcher } from "./watcher.js";

// The Hub watcher watches the whole .sdd/ tree recursively. These tests assert
// that changes inside the .sdd/projections/ (SPEC-scr-040) and .sdd/design/
// (SPEC-scr-042) subtrees fire the same onChange callback that drives the
// sdd-changed WebSocket broadcast.

const DEBOUNCE_WAIT = 400;

function makeTmpWorkspace(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-spec-scr-test-"));
  fs.mkdirSync(path.join(root, ".sdd", "specs"), { recursive: true });
  return root;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("startWatcher — projections directory (SPEC-scr-040)", () => {
  it("SPEC-scr-040: fires onChange when a file under .sdd/projections/ is added", async () => {
    const workspace = makeTmpWorkspace();
    fs.mkdirSync(path.join(workspace, ".sdd", "projections"), { recursive: true });
    const changed: string[] = [];
    const stop = startWatcher(workspace, (p) => changed.push(p));
    // chokidar starts watching asynchronously; give it time to become ready
    // before writing (matches watcher.test.ts, which waits before its writes).
    await wait(300);

    const projFile = path.join(workspace, ".sdd", "projections", "overview.md");
    fs.writeFileSync(projFile, "# Overview\n\nLive content.");
    await wait(DEBOUNCE_WAIT);

    stop();
    expect(changed.length).toBeGreaterThanOrEqual(1);
    expect(changed.some((p) => p.includes("overview.md"))).toBe(true);
  });

  it("SPEC-scr-040: fires onChange when a projection file changes", async () => {
    const workspace = makeTmpWorkspace();
    const projDir = path.join(workspace, ".sdd", "projections");
    fs.mkdirSync(projDir, { recursive: true });
    const projFile = path.join(projDir, "status.md");
    fs.writeFileSync(projFile, "# Status v1");
    const changed: string[] = [];
    const stop = startWatcher(workspace, (p) => changed.push(p));
    await wait(300);

    fs.writeFileSync(projFile, "# Status v2");
    await wait(DEBOUNCE_WAIT);

    stop();
    expect(changed.some((p) => p.includes("status.md"))).toBe(true);
  });
});

describe("startWatcher — design directory (SPEC-scr-042)", () => {
  it("SPEC-scr-042: fires onChange when a file under .sdd/design/ is added", async () => {
    const workspace = makeTmpWorkspace();
    fs.mkdirSync(path.join(workspace, ".sdd", "design", "auth-flow"), { recursive: true });
    const changed: string[] = [];
    const stop = startWatcher(workspace, (p) => changed.push(p));
    await wait(300);

    const designFile = path.join(workspace, ".sdd", "design", "auth-flow", "design.md");
    fs.writeFileSync(designFile, "# Auth Flow\n\nDesign content.");
    await wait(DEBOUNCE_WAIT);

    stop();
    expect(changed.length).toBeGreaterThanOrEqual(1);
    expect(changed.some((p) => p.includes("design.md"))).toBe(true);
  });

  it("SPEC-scr-042: fires onChange when a design.md changes", async () => {
    const workspace = makeTmpWorkspace();
    const designDir = path.join(workspace, ".sdd", "design", "dashboard");
    fs.mkdirSync(designDir, { recursive: true });
    const designFile = path.join(designDir, "design.md");
    fs.writeFileSync(designFile, "# Dashboard v1");
    const changed: string[] = [];
    const stop = startWatcher(workspace, (p) => changed.push(p));
    await wait(300);

    fs.writeFileSync(designFile, "# Dashboard v2");
    await wait(DEBOUNCE_WAIT);

    stop();
    expect(changed.some((p) => p.includes("design.md"))).toBe(true);
  });
});

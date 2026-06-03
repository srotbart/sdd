import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { startWatcher } from "./watcher.js";

const DEBOUNCE_WAIT = 400;

function makeTmpWorkspace(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sdd-watcher-test-"));
  fs.mkdirSync(path.join(root, ".sdd", "specs"), { recursive: true });
  fs.mkdirSync(path.join(root, ".sdd", "targets"), { recursive: true });
  return root;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("startWatcher — sdd directory changes", () => {
  it("calls onChange when a file under .sdd changes", async () => {
    const workspace = makeTmpWorkspace();
    const changed: string[] = [];
    const stop = startWatcher(workspace, (p) => changed.push(p));
    // chokidar starts watching asynchronously; on Windows its startup is slower,
    // so give it time to become ready before writing (matches the other tests
    // here, which all wait before their first write).
    await wait(300);

    const targetFile = path.join(workspace, ".sdd", "targets", "TGT-001.md");
    fs.writeFileSync(targetFile, "# Target");
    await wait(DEBOUNCE_WAIT);

    stop();
    expect(changed.length).toBeGreaterThanOrEqual(1);
    expect(changed.some((p) => p.includes("TGT-001.md"))).toBe(true);
  });
});

describe("startWatcher — test report file watching", () => {
  it("calls onSpecsChanged when a watched report file changes", async () => {
    const workspace = makeTmpWorkspace();
    const reportPath = path.join(workspace, "test-results", "vitest.json");
    fs.mkdirSync(path.join(workspace, "test-results"), { recursive: true });
    fs.writeFileSync(reportPath, "{}");

    const mapping = {
      runner: "vitest",
      report: "test-results/vitest.json",
      items: {},
    };
    fs.mkdirSync(path.join(workspace, ".sdd", "specs", "architecture"), { recursive: true });
    fs.writeFileSync(
      path.join(workspace, ".sdd", "specs", "architecture", "SPEC-arch.tests.json"),
      JSON.stringify(mapping)
    );

    const specsChangedCalls: number[] = [];
    const stop = startWatcher(
      workspace,
      () => {},
      () => specsChangedCalls.push(Date.now())
    );

    await wait(500);
    fs.writeFileSync(reportPath, '{"startTime":1}');
    await wait(DEBOUNCE_WAIT);

    stop();
    expect(specsChangedCalls.length).toBeGreaterThanOrEqual(1);
  });

  it("does not call onSpecsChanged for .sdd directory changes", async () => {
    const workspace = makeTmpWorkspace();
    const mapping = {
      runner: "vitest",
      report: "test-results/vitest.json",
      items: {},
    };
    fs.writeFileSync(
      path.join(workspace, ".sdd", "specs", "SPEC-arch.tests.json"),
      JSON.stringify(mapping)
    );

    const specsChangedCalls: number[] = [];
    const sddChangedCalls: string[] = [];
    const stop = startWatcher(
      workspace,
      (p) => sddChangedCalls.push(p),
      () => specsChangedCalls.push(Date.now())
    );

    await wait(100);
    fs.writeFileSync(path.join(workspace, ".sdd", "targets", "TGT-002.md"), "# T");
    await wait(DEBOUNCE_WAIT);

    stop();
    expect(sddChangedCalls.length).toBeGreaterThanOrEqual(1);
    expect(specsChangedCalls.length).toBe(0);
  });

  it("picks up new report paths when a .tests.json mapping file is added", async () => {
    const workspace = makeTmpWorkspace();
    const reportPath = path.join(workspace, "reports", "new-report.json");
    fs.mkdirSync(path.join(workspace, "reports"), { recursive: true });
    fs.writeFileSync(reportPath, "{}");

    const specsChangedCalls: number[] = [];
    const stop = startWatcher(
      workspace,
      () => {},
      () => specsChangedCalls.push(Date.now())
    );

    await wait(100);

    const mapping = { runner: "vitest", report: "reports/new-report.json", items: {} };
    fs.mkdirSync(path.join(workspace, ".sdd", "specs", "workflow"), { recursive: true });
    fs.writeFileSync(
      path.join(workspace, ".sdd", "specs", "workflow", "SPEC-wf.tests.json"),
      JSON.stringify(mapping)
    );
    await wait(DEBOUNCE_WAIT);

    fs.writeFileSync(reportPath, '{"startTime":2}');
    await wait(DEBOUNCE_WAIT);

    stop();
    expect(specsChangedCalls.length).toBeGreaterThanOrEqual(1);
  });
});

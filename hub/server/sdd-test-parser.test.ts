import { describe, it, expect } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  readTestMapping,
  parseVitestReport,
  parseSurefireReports,
  computeTestStatus,
  type TestMapping,
  type ParsedReport,
} from "./sdd-parser.js";

function makeTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "sdd-test-parser-"));
}

// --- readTestMapping ---

describe("readTestMapping", () => {
  it("returns null when mapping file does not exist", () => {
    const root = makeTmpDir();
    fs.mkdirSync(path.join(root, "specs", "architecture"), { recursive: true });
    expect(readTestMapping(root, "arch", "architecture")).toBeNull();
  });

  it("parses a valid mapping file", () => {
    const root = makeTmpDir();
    fs.mkdirSync(path.join(root, "specs", "architecture"), { recursive: true });
    const mapping: TestMapping = {
      runner: "vitest",
      report: "hub/server/test-results/vitest.json",
      items: {
        "SPEC-arch-001": ["Node.js server"],
        "SPEC-arch-002": ["React", "frontend"],
      },
    };
    fs.writeFileSync(path.join(root, "specs", "architecture", "SPEC-arch.tests.json"), JSON.stringify(mapping));
    expect(readTestMapping(root, "arch", "architecture")).toEqual(mapping);
  });

  it("returns null for malformed JSON", () => {
    const root = makeTmpDir();
    fs.mkdirSync(path.join(root, "specs", "architecture"), { recursive: true });
    fs.writeFileSync(path.join(root, "specs", "architecture", "SPEC-arch.tests.json"), "{ bad json }");
    expect(readTestMapping(root, "arch", "architecture")).toBeNull();
  });
});

// --- parseVitestReport ---

const VITEST_REPORT = JSON.stringify({
  startTime: 1716000000000,
  testResults: [
    {
      assertionResults: [
        { fullName: "Node.js server starts on port 22351", status: "passed" },
        { fullName: "Node.js server handles EADDRINUSE", status: "passed" },
        { fullName: "React frontend renders correctly", status: "failed" },
      ],
    },
    {
      assertionResults: [
        { fullName: "SQLite persistence saves workspace", status: "passed" },
      ],
    },
  ],
});

describe("parseVitestReport", () => {
  it("returns null when file does not exist", () => {
    expect(parseVitestReport("/nonexistent/path/report.json")).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    const dir = makeTmpDir();
    const p = path.join(dir, "report.json");
    fs.writeFileSync(p, "not json");
    expect(parseVitestReport(p)).toBeNull();
  });

  it("parses testResults[*].assertionResults into flat test list", () => {
    const dir = makeTmpDir();
    const p = path.join(dir, "report.json");
    fs.writeFileSync(p, VITEST_REPORT);
    const result = parseVitestReport(p);
    expect(result).not.toBeNull();
    expect(result!.tests).toHaveLength(4);
    expect(result!.tests[0]).toEqual({ fullName: "Node.js server starts on port 22351", status: "passed" });
    expect(result!.tests[2]).toEqual({ fullName: "React frontend renders correctly", status: "failed" });
  });

  it("converts startTime milliseconds to ISO string for runAt", () => {
    const dir = makeTmpDir();
    const p = path.join(dir, "report.json");
    fs.writeFileSync(p, VITEST_REPORT);
    const result = parseVitestReport(p);
    expect(result!.runAt).toBe(new Date(1716000000000).toISOString());
  });
});

// --- parseSurefireReports ---

const SUREFIRE_XML_PASSING = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="com.example.ServerTest" timestamp="2026-05-18T10:00:00">
  <testcase classname="com.example.ServerTest" name="testNodeRuntime" time="0.1"/>
  <testcase classname="com.example.ServerTest" name="testSQLitePersistence" time="0.2"/>
</testsuite>`;

const SUREFIRE_XML_WITH_FAILURE = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="com.example.AgentTest" timestamp="2026-05-18T10:01:00">
  <testcase classname="com.example.AgentTest" name="testAgentStatus" time="0.3">
    <failure message="expected busy">AssertionError: expected busy but was idle</failure>
  </testcase>
  <testcase classname="com.example.AgentTest" name="testHeartbeat" time="0.1"/>
</testsuite>`;

describe("parseSurefireReports", () => {
  it("returns null when directory does not exist", () => {
    expect(parseSurefireReports("/nonexistent/surefire-reports")).toBeNull();
  });

  it("returns null when directory has no TEST-*.xml files", () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, "other.xml"), "<x/>");
    expect(parseSurefireReports(dir)).toBeNull();
  });

  it("parses testcase elements from all TEST-*.xml files", () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, "TEST-ServerTest.xml"), SUREFIRE_XML_PASSING);
    fs.writeFileSync(path.join(dir, "TEST-AgentTest.xml"), SUREFIRE_XML_WITH_FAILURE);
    const result = parseSurefireReports(dir);
    expect(result).not.toBeNull();
    expect(result!.tests).toHaveLength(4);
  });

  it("marks testcase with <failure> child as failed", () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, "TEST-AgentTest.xml"), SUREFIRE_XML_WITH_FAILURE);
    const result = parseSurefireReports(dir);
    const failing = result!.tests.find((t) => t.fullName.includes("testAgentStatus"));
    const passing = result!.tests.find((t) => t.fullName.includes("testHeartbeat"));
    expect(failing!.status).toBe("failed");
    expect(passing!.status).toBe("passed");
  });

  it("builds fullName as classname + space + name", () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, "TEST-ServerTest.xml"), SUREFIRE_XML_PASSING);
    const result = parseSurefireReports(dir);
    expect(result!.tests[0]!.fullName).toBe("com.example.ServerTest testNodeRuntime");
  });

  it("extracts runAt from testsuite timestamp attribute", () => {
    const dir = makeTmpDir();
    fs.writeFileSync(path.join(dir, "TEST-ServerTest.xml"), SUREFIRE_XML_PASSING);
    const result = parseSurefireReports(dir);
    expect(result!.runAt).toBe(new Date("2026-05-18T10:00:00").toISOString());
  });
});

// --- computeTestStatus ---

const MAPPING: TestMapping = {
  runner: "vitest",
  report: "report.json",
  items: {
    "SPEC-arch-001": ["Node.js server"],
    "SPEC-arch-002": ["React frontend"],
  },
};

const REPORT_ALL_PASSING: ParsedReport = {
  runAt: "2026-05-18T10:00:00.000Z",
  tests: [
    { fullName: "Node.js server starts on port 22351", status: "passed" },
    { fullName: "React frontend renders correctly", status: "passed" },
  ],
};

const REPORT_WITH_FAILURE: ParsedReport = {
  runAt: "2026-05-18T10:00:00.000Z",
  tests: [
    { fullName: "Node.js server starts on port 22351", status: "passed" },
    { fullName: "React frontend renders correctly", status: "failed" },
  ],
};

describe("computeTestStatus", () => {
  it("returns not-run when report is null (report file missing)", () => {
    const result = computeTestStatus("SPEC-arch-001", MAPPING, null);
    expect(result.status).toBe("not-run");
    expect(result.lastRun).toBeUndefined();
  });

  it("returns missing when mapping is null (no .tests.json file)", () => {
    const result = computeTestStatus("SPEC-arch-001", null, REPORT_ALL_PASSING);
    expect(result.status).toBe("missing");
    expect(result.lastRun).toBe(REPORT_ALL_PASSING.runAt);
  });

  it("returns missing when spec item has no entry in mapping items", () => {
    const result = computeTestStatus("SPEC-arch-999", MAPPING, REPORT_ALL_PASSING);
    expect(result.status).toBe("missing");
    expect(result.lastRun).toBe(REPORT_ALL_PASSING.runAt);
  });

  it("returns missing when no test fullName matches any mapped substring", () => {
    const result = computeTestStatus("SPEC-arch-001", MAPPING, {
      runAt: "2026-05-18T10:00:00.000Z",
      tests: [{ fullName: "unrelated test about something else", status: "passed" }],
    });
    expect(result.status).toBe("missing");
  });

  it("returns passing when all matched tests pass", () => {
    const result = computeTestStatus("SPEC-arch-001", MAPPING, REPORT_ALL_PASSING);
    expect(result.status).toBe("passing");
    expect(result.lastRun).toBe(REPORT_ALL_PASSING.runAt);
  });

  it("returns failing when any matched test fails", () => {
    const result = computeTestStatus("SPEC-arch-002", MAPPING, REPORT_WITH_FAILURE);
    expect(result.status).toBe("failing");
    expect(result.lastRun).toBe(REPORT_WITH_FAILURE.runAt);
  });

  it("substring matching is case-insensitive", () => {
    const result = computeTestStatus("SPEC-arch-001", MAPPING, {
      runAt: "2026-05-18T10:00:00.000Z",
      tests: [{ fullName: "NODE.JS SERVER starts correctly", status: "passed" }],
    });
    expect(result.status).toBe("passing");
  });

  it("not-run takes precedence over all other states (null report)", () => {
    const result = computeTestStatus("SPEC-arch-001", MAPPING, null);
    expect(result.status).toBe("not-run");
  });
});

import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SKILL_PATH = path.resolve(
  __dirname,
  "../../plugin/skills/spec-test/SKILL.md"
);

describe("spec-test SKILL.md next-step footer (SPEC-wf-008)", () => {
  it("SKILL.md file exists", () => {
    expect(fs.existsSync(SKILL_PATH)).toBe(true);
  });

  it("contains next-step footer referencing session-start after the report example", () => {
    const content = fs.readFileSync(SKILL_PATH, "utf8");
    expect(content).toMatch(/Run the test suite then.*\/sdd:session-start/);
  });

  it("footer appears after the report example closing fence", () => {
    const content = fs.readFileSync(SKILL_PATH, "utf8");
    const fenceIdx = content.lastIndexOf("```\n\nThe final line after");
    expect(fenceIdx).toBeGreaterThan(-1);
  });
});

describe("spec-test SKILL.md mapping file step (SPEC-wf-022)", () => {
  it("SKILL.md mentions SPEC-{abbrev}.tests.json mapping file", () => {
    const content = fs.readFileSync(SKILL_PATH, "utf8");
    expect(content).toMatch(/SPEC-.*\.tests\.json/);
  });

  it("SKILL.md mapping step includes runner, report, and items fields", () => {
    const content = fs.readFileSync(SKILL_PATH, "utf8");
    expect(content).toMatch(/"runner"/);
    expect(content).toMatch(/"report"/);
    expect(content).toMatch(/"items"/);
  });

  it("SKILL.md mapping step appears after the spec item update step", () => {
    const content = fs.readFileSync(SKILL_PATH, "utf8");
    const specItemStepIdx = content.indexOf("### 5. Update the spec item");
    const mappingStepIdx = content.indexOf("SPEC-{abbrev}.tests.json");
    expect(specItemStepIdx).toBeGreaterThan(-1);
    expect(mappingStepIdx).toBeGreaterThan(specItemStepIdx);
  });

  it("SKILL.md mapping file step is numbered as a procedure step (step 6)", () => {
    const content = fs.readFileSync(SKILL_PATH, "utf8");
    expect(content).toMatch(/###\s+6\./);
  });
});

describe("spec-test SKILL.md report path wiring (SPEC-wf-022)", () => {
  it("SKILL.md instructs ensuring the report path is produced by the test runner", () => {
    const content = fs.readFileSync(SKILL_PATH, "utf8");
    expect(content).toMatch(/report.*path.*produced|report.*runner|runner.*report/i);
  });

  it("SKILL.md mentions reporter configuration (e.g. --reporter=json or outputFile)", () => {
    const content = fs.readFileSync(SKILL_PATH, "utf8");
    expect(content).toMatch(/reporter|outputFile/i);
  });

  it("SKILL.md warns that missing report file leaves testStatus as not-run", () => {
    const content = fs.readFileSync(SKILL_PATH, "utf8");
    expect(content).toMatch(/not-run/);
    expect(content).toMatch(/report.*not exist|does not exist.*report|report file/i);
  });
});

describe("spec-test SKILL.md skip convention (SPEC-wf-022)", () => {
  it("SKILL.md mentions the **Tests:** skipped — <reason> convention", () => {
    const content = fs.readFileSync(SKILL_PATH, "utf8");
    expect(content).toMatch(/\*\*Tests:\*\*\s+skipped/);
  });

  it("SKILL.md skip convention step instructs writing the reason rather than leaving the item blank", () => {
    const content = fs.readFileSync(SKILL_PATH, "utf8");
    // Should mention that skipped is preferred over leaving blank
    expect(content).toMatch(/leaving.*blank|blank.*leaving|rather than leaving/i);
  });

  it("SKILL.md constraints section states skipped items are excluded from the items map", () => {
    const content = fs.readFileSync(SKILL_PATH, "utf8");
    const constraintsIdx = content.indexOf("## Constraints");
    const skippedConstraintIdx = content.indexOf("excluded from", constraintsIdx);
    expect(constraintsIdx).toBeGreaterThan(-1);
    expect(skippedConstraintIdx).toBeGreaterThan(constraintsIdx);
  });
});

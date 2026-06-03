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

import { describe, it, expect } from "vitest";
import path from "node:path";
import { resolveArtifact } from "./sdd-artifact.js";

const sep = path.sep;

describe("resolveArtifact", () => {
  it("returns 'targets' for a file inside .sdd/targets/", () => {
    expect(resolveArtifact(`/home/user/project${sep}.sdd${sep}targets${sep}TGT-001.md`)).toBe("targets");
  });

  it("returns 'specs' for a file inside .sdd/specs/", () => {
    expect(resolveArtifact(`/home/user/project${sep}.sdd${sep}specs${sep}SPEC-arch.md`)).toBe("specs");
  });

  it("returns 'gaps' for a file inside .sdd/gaps/", () => {
    expect(resolveArtifact(`/home/user/project${sep}.sdd${sep}gaps${sep}GAP-arch-001.md`)).toBe("gaps");
  });

  it("returns 'work-items' for a file inside .sdd/work-items/", () => {
    expect(resolveArtifact(`/home/user/project${sep}.sdd${sep}work-items${sep}WI-arch-001.md`)).toBe("work-items");
  });

  it("returns 'targets' for a file inside .sdd/targets/archive/", () => {
    expect(resolveArtifact(`/home/user/project${sep}.sdd${sep}targets${sep}archive${sep}TGT-001.md`)).toBe("targets");
  });

  it("returns 'gaps' for a file inside .sdd/gaps/archive/", () => {
    expect(resolveArtifact(`/home/user/project${sep}.sdd${sep}gaps${sep}archive${sep}GAP-arch-001.md`)).toBe("gaps");
  });

  it("returns 'work-items' for a file inside .sdd/work-items/archive/", () => {
    expect(resolveArtifact(`/home/user/project${sep}.sdd${sep}work-items${sep}archive${sep}WI-arch-001.md`)).toBe("work-items");
  });

  it("returns null for a path outside the four tracked directories", () => {
    expect(resolveArtifact(`/home/user/project${sep}.sdd${sep}design${sep}some-file.md`)).toBeNull();
  });

  it("returns null for a path with no .sdd directory", () => {
    expect(resolveArtifact(`/home/user/project${sep}src${sep}index.ts`)).toBeNull();
  });

  it("does not false-match a directory that contains the name as a substring", () => {
    expect(resolveArtifact(`/home/user/project${sep}.sdd${sep}my-gaps-extra${sep}file.md`)).toBeNull();
  });
});

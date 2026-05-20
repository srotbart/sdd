import path from "node:path";
import type { SddArtifact } from "./ws-ui.js";

const SDD_ARTIFACT_DIRS: Array<[string, SddArtifact]> = [
  [path.join(".sdd", "targets"), "targets"],
  [path.join(".sdd", "specs"), "specs"],
  [path.join(".sdd", "gaps"), "gaps"],
  [path.join(".sdd", "work-items"), "work-items"],
];

export function resolveArtifact(changedPath: string): SddArtifact | null {
  for (const [dir, artifact] of SDD_ARTIFACT_DIRS) {
    if (changedPath.includes(path.sep + dir + path.sep) || changedPath.endsWith(path.sep + dir)) {
      return artifact;
    }
  }
  return null;
}

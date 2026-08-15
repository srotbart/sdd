import chokidar from "chokidar";
import fs from "node:fs";
import path from "node:path";
import { collectSpecsTree } from "./sdd-parser.js";

const DEBOUNCE_MS = 200;

function readReportPaths(sddPath: string): Set<string> {
  const reportPaths = new Set<string>();

  // Mapping files live anywhere in the component tree (next to the items they
  // map). collectSpecsTree is the single source for the specs-tree walk, so
  // the watcher and parseSpecs always agree on what counts as a mapping file.
  const { mappingFiles } = collectSpecsTree(path.join(sddPath, "specs"));
  for (const { filePath } of mappingFiles) {
    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const mapping = JSON.parse(raw) as { report?: unknown };
      if (typeof mapping.report === "string" && mapping.report) {
        reportPaths.add(mapping.report);
      }
    } catch {
      // skip malformed mapping files
    }
  }
  return reportPaths;
}

export function startWatcher(
  workspacePath: string,
  onChange: (changedPath: string) => void,
  onSpecsChanged?: () => void
): () => void {
  const sddPath = path.join(workspacePath, ".sdd");
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  // Pending state accumulated across a debounce window. Report and non-report changes are
  // tracked separately so that if both kinds occur within one window, both callbacks fire
  // — previously a single shared timer + last-event state dropped one of them.
  let pendingChange = false;
  let pendingChangePath = sddPath;
  let pendingReport = false;
  let pendingTestsJsonChanged = false;

  let watchedReportPaths = readReportPaths(sddPath);

  const watcher = chokidar.watch(sddPath, {
    ignoreInitial: true,
    persistent: true,
  });

  for (const reportPath of watchedReportPaths) {
    const absReport = path.isAbsolute(reportPath)
      ? reportPath
      : path.join(workspacePath, reportPath);
    watcher.add(absReport);
  }

  const scheduleDebounced = (filePath: string, isReport: boolean): void => {
    if (isReport) {
      pendingReport = true;
    } else {
      pendingChange = true;
      pendingChangePath = filePath;
      if (filePath.endsWith(".tests.json")) { pendingTestsJsonChanged = true; }
    }
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      const flushChange = pendingChange;
      const flushChangePath = pendingChangePath;
      const flushReport = pendingReport;
      const flushTestsJson = pendingTestsJsonChanged;
      pendingChange = false;
      pendingReport = false;
      pendingTestsJsonChanged = false;

      if (flushChange) {
        onChange(flushChangePath);

        if (flushTestsJson) {
          const newReportPaths = readReportPaths(sddPath);
          for (const reportPath of newReportPaths) {
            if (!watchedReportPaths.has(reportPath)) {
              const absReport = path.isAbsolute(reportPath)
                ? reportPath
                : path.join(workspacePath, reportPath);
              watcher.add(absReport);
            }
          }
          watchedReportPaths = newReportPaths;
        }
      }
      if (flushReport) {
        onSpecsChanged?.();
      }
    }, DEBOUNCE_MS);
  };

  const handleChange = (filePath: string): void => {
    const absReport = (reportPath: string): string =>
      path.isAbsolute(reportPath)
        ? reportPath
        : path.join(workspacePath, reportPath);

    const isReport = [...watchedReportPaths].some(
      (r) => absReport(r) === filePath
    );
    scheduleDebounced(filePath, isReport);
  };

  watcher.on("add", handleChange);
  watcher.on("change", handleChange);
  watcher.on("unlink", handleChange);

  return () => {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    watcher.close();
  };
}

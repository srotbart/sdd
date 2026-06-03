import chokidar from "chokidar";
import fs from "node:fs";
import path from "node:path";

const DEBOUNCE_MS = 200;

function readReportPaths(sddPath: string): Set<string> {
  const specsDir = path.join(sddPath, "specs");
  const reportPaths = new Set<string>();
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(specsDir, { withFileTypes: true });
  } catch {
    return reportPaths;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const domainDir = path.join(specsDir, entry.name);
    let files: string[];
    try {
      files = fs.readdirSync(domainDir).filter((f) => f.endsWith(".tests.json"));
    } catch {
      continue;
    }
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(domainDir, file), "utf8");
        const mapping = JSON.parse(raw) as { report?: unknown };
        if (typeof mapping.report === "string" && mapping.report) {
          reportPaths.add(mapping.report);
        }
      } catch {
        // skip malformed mapping files
      }
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
  let lastChangedPath = sddPath;

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
    lastChangedPath = filePath;
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      if (isReport) {
        onSpecsChanged?.();
      } else {
        onChange(lastChangedPath);

        if (filePath.endsWith(".tests.json")) {
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

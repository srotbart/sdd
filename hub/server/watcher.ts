import chokidar from "chokidar";
import path from "node:path";

const DEBOUNCE_MS = 200;

export function startWatcher(
  workspacePath: string,
  onChange: (changedPath: string) => void
): () => void {
  const sddPath = path.join(workspacePath, ".sdd");
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastChangedPath = sddPath;

  const watcher = chokidar.watch(sddPath, {
    ignoreInitial: true,
    persistent: true,
  });

  const handleChange = (filePath: string): void => {
    lastChangedPath = filePath;
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      onChange(lastChangedPath);
    }, DEBOUNCE_MS);
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

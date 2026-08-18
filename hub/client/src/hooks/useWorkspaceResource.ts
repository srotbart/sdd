import { useEffect, useState } from 'react';

interface WorkspaceResource<T> {
  data: T | null;
  loading: boolean;
  error: boolean;
}

/**
 * Fetch a workspace-scoped JSON resource, refetching when `refreshToken`
 * bumps (live sdd-changed events). The one parametrised fetch effect behind
 * every screen's list/graph load — per the one-source-per-mechanism standard
 * (ISS-ui-001), so cancellation and error handling cannot drift per screen.
 */
export function useWorkspaceResource<T>(
  workspaceId: string | null,
  resourcePath: string,
  refreshToken?: number
): WorkspaceResource<T> {
  const [state, setState] = useState<WorkspaceResource<T>>({ data: null, loading: false, error: false });

  useEffect(() => {
    if (!workspaceId) {
      setState({ data: null, loading: false, error: false });
      return;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    fetch(`/workspaces/${workspaceId}/${resourcePath}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: T) => {
        if (!cancelled) setState({ data, loading: false, error: false });
      })
      .catch(() => {
        // A failed load is an error state, not an empty resource. Data from a
        // previous successful load is kept; the caller decides what to show.
        if (!cancelled) setState((s) => ({ data: s.data, loading: false, error: true }));
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, resourcePath, refreshToken]);

  return state;
}

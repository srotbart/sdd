import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWorkspaceResource } from './useWorkspaceResource';

// ---------------------------------------------------------------------------
// ISS-ui-001 — the one parametrised workspace fetch effect behind every
// screen's list/graph load: URL shape, refresh, cancellation, error handling.
// ---------------------------------------------------------------------------

function mockFetch(response: unknown, status = 200): ReturnType<typeof vi.fn> {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(response),
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useWorkspaceResource', () => {
  it('fetches the workspace-scoped resource and returns its data', async () => {
    const fetchMock = mockFetch([{ name: 'a' }]);
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => useWorkspaceResource<Array<{ name: string }>>('ws1', 'designs', 0));

    await waitFor(() => expect(result.current.data).toEqual([{ name: 'a' }]));
    expect(fetchMock).toHaveBeenCalledWith('/workspaces/ws1/designs');
    expect(result.current.error).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('reports a non-ok response as an error state, not as data', async () => {
    global.fetch = mockFetch({ error: 'not found' }, 404) as unknown as typeof fetch;

    const { result } = renderHook(() => useWorkspaceResource('ws1', 'standards'));

    await waitFor(() => expect(result.current.error).toBe(true));
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('does not fetch without a workspace id', () => {
    const fetchMock = mockFetch([]);
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = renderHook(() => useWorkspaceResource(null, 'standards'));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current).toEqual({ data: null, loading: false, error: false });
  });

  it('refetches when refreshToken bumps and keeps prior data on a failed refetch', async () => {
    const fetchMock = mockFetch(['v1']);
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result, rerender } = renderHook(
      ({ token }: { token: number }) => useWorkspaceResource<string[]>('ws1', 'projections', token),
      { initialProps: { token: 0 } }
    );
    await waitFor(() => expect(result.current.data).toEqual(['v1']));

    global.fetch = mockFetch(null, 500) as unknown as typeof fetch;
    rerender({ token: 1 });

    await waitFor(() => expect(result.current.error).toBe(true));
    // Stale-but-real data is kept; the caller decides what to show.
    expect(result.current.data).toEqual(['v1']);
  });
});

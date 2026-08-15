import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Map, type MapNode } from './Map';

function node(partial: Partial<MapNode> & { path: string }): MapNode {
  return {
    area: partial.path.split('/')[0],
    depth: partial.path.split('/').length,
    abbrev: null,
    description: '',
    hasManifest: false,
    itemCount: 0,
    subtreeItemCount: 0,
    openGaps: 0,
    uncovered: 0,
    failing: 0,
    dependsOn: [],
    ...partial,
  };
}

function mockFetch(graph: { nodes: MapNode[]; edges: Array<{ from: string; to: string }> }) {
  return vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(graph),
    })
  ) as unknown as typeof fetch;
}

describe('Map screen', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders areas and nested components with badges', async () => {
    global.fetch = mockFetch({
      nodes: [
        node({ path: 'hub', subtreeItemCount: 3, openGaps: 2 }),
        node({ path: 'hub/server', abbrev: 'hsrv', itemCount: 2, subtreeItemCount: 2, openGaps: 2, failing: 1 }),
        node({ path: 'hub/client', itemCount: 1, subtreeItemCount: 1, uncovered: 1 }),
      ],
      edges: [{ from: 'hub/client', to: 'hub/server' }],
    });

    render(<Map workspaceId="ws1" />);

    await waitFor(() => expect(screen.getByText('server')).toBeInTheDocument());
    expect(screen.getByText('client')).toBeInTheDocument();
    expect(screen.getByText('hsrv')).toBeInTheDocument();
    // Gap badges roll up: both the hub area and hub/server show them.
    expect(screen.getAllByText('2 gaps').length).toBeGreaterThan(0);
    expect(screen.getByText('1 failing')).toBeInTheDocument();
    expect(screen.getByText('1 uncovered')).toBeInTheDocument();
  });

  it('opens the detail panel when a component is selected', async () => {
    global.fetch = mockFetch({
      nodes: [
        node({ path: 'hub', subtreeItemCount: 1 }),
        node({
          path: 'hub/server',
          abbrev: 'hsrv',
          hasManifest: true,
          description: 'The hub HTTP + WS server.',
          itemCount: 1,
          subtreeItemCount: 1,
          dependsOn: ['hub/client'],
        }),
      ],
      edges: [],
    });

    render(<Map workspaceId="ws1" />);
    await waitFor(() => expect(screen.getByText('server')).toBeInTheDocument());

    await userEvent.click(screen.getByText('server'));
    expect(screen.getByText('hub/server')).toBeInTheDocument();
    expect(screen.getByText('The hub HTTP + WS server.')).toBeInTheDocument();
    expect(screen.getByText('hub/client')).toBeInTheDocument();
    // "component.md" also appears in the no-edges hint; the detail fact is a <dd>.
    expect(screen.getAllByText('component.md').length).toBeGreaterThan(0);
  });

  it('shows the empty state when there are no components', async () => {
    global.fetch = mockFetch({ nodes: [], edges: [] });

    render(<Map workspaceId="ws1" />);
    await waitFor(() =>
      expect(screen.getByText(/No components yet/)).toBeInTheDocument()
    );
  });

  it('shows the manifest hint when there are nodes but no edges', async () => {
    global.fetch = mockFetch({
      nodes: [node({ path: 'authentication', itemCount: 2, subtreeItemCount: 2 })],
      edges: [],
    });

    render(<Map workspaceId="ws1" />);
    // Area title and node name both render the one-segment path.
    await waitFor(() => expect(screen.getAllByText('authentication').length).toBeGreaterThan(0));
    expect(screen.getByText(/Dependency edges appear/)).toBeInTheDocument();
  });
});

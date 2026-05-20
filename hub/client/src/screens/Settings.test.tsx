import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from './Settings';

const WORKSPACE = { id: 'ws-1', name: 'My Repo', path: '/tmp/repo', description: 'A project' };

function mockFetch(patchSpy?: (url: string, body: unknown) => void) {
  global.fetch = vi.fn((url: string, opts?: RequestInit) => {
    if (opts?.method === 'PATCH' && patchSpy) {
      patchSpy(url, JSON.parse(opts.body as string));
      return Promise.resolve({ json: () => Promise.resolve({ ...WORKSPACE }) } as Response);
    }
    return Promise.resolve({
      json: () => Promise.resolve([WORKSPACE]),
    } as Response);
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  mockFetch();
});

describe('Settings blur-persist', () => {
  it('renders no save button', async () => {
    render(<Settings workspaceId="ws-1" />);
    await waitFor(() => screen.getByDisplayValue('My Repo'));
    expect(screen.queryByRole('button', { name: /save/i })).toBeNull();
  });

  it('does not call PATCH before blur', async () => {
    const patchSpy = vi.fn();
    mockFetch(patchSpy);
    render(<Settings workspaceId="ws-1" />);
    await waitFor(() => screen.getByDisplayValue('My Repo'));
    await userEvent.type(screen.getByDisplayValue('My Repo'), ' Updated');
    expect(patchSpy).not.toHaveBeenCalled();
  });

  it('calls PATCH /workspaces/:id with only the changed name field on blur', async () => {
    const patchSpy = vi.fn();
    mockFetch(patchSpy);
    render(<Settings workspaceId="ws-1" />);
    const input = await waitFor(() => screen.getByDisplayValue('My Repo'));
    await userEvent.clear(input);
    await userEvent.type(input, 'New Name');
    await userEvent.tab();
    expect(patchSpy).toHaveBeenCalledOnce();
    expect(patchSpy).toHaveBeenCalledWith('/workspaces/ws-1', { name: 'New Name' });
  });

  it('does not call PATCH when field value is unchanged on blur', async () => {
    const patchSpy = vi.fn();
    mockFetch(patchSpy);
    render(<Settings workspaceId="ws-1" />);
    const input = await waitFor(() => screen.getByDisplayValue('My Repo'));
    await userEvent.click(input);
    await userEvent.tab();
    expect(patchSpy).not.toHaveBeenCalled();
  });

  it('calls PATCH with only the description field when description changes', async () => {
    const patchSpy = vi.fn();
    mockFetch(patchSpy);
    render(<Settings workspaceId="ws-1" />);
    const input = await waitFor(() => screen.getByDisplayValue('A project'));
    await userEvent.clear(input);
    await userEvent.type(input, 'New desc');
    await userEvent.tab();
    expect(patchSpy).toHaveBeenCalledOnce();
    expect(patchSpy).toHaveBeenCalledWith('/workspaces/ws-1', { description: 'New desc' });
  });
});

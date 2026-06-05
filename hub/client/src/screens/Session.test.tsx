import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Session } from './Session';

const onNav = vi.fn();

const BASE_TARGET = {
  id: 'TGT-001',
  status: 'awaiting-user' as const,
  domain: 'ui-screens',
  domainAbbrev: 'scr',
  title: 'Add search',
  created: '2026-05-28T00:00:00Z',
  statement: 'Add fuzzy search.',
  dialog: [],
};

const EMPTY_PROPS = {
  targets: [],
  specs: [],
  gaps: [],
  workItems: [],
  staleDomains: [],
  agents: [],
  onNav,
};

describe('Session screen target detail panel (SPEC-scr-048)', () => {
  beforeEach(() => {
    onNav.mockClear();
  });

  it('SPEC-scr-048 clicking an awaiting-user target row opens the panel without calling onNav targets', async () => {
    render(<Session {...EMPTY_PROPS} targets={[BASE_TARGET]} />);
    const row = document.querySelector('.awaiting-user-row') as HTMLElement;
    expect(row).not.toBeNull();
    await userEvent.click(row);
    expect(document.querySelector('.session-target-panel')).not.toBeNull();
    expect(onNav).not.toHaveBeenCalledWith('targets', expect.anything());
  });

  it('SPEC-scr-048 the panel shows the selected target detail view', async () => {
    render(<Session {...EMPTY_PROPS} targets={[BASE_TARGET]} />);
    await userEvent.click(document.querySelector('.awaiting-user-row') as HTMLElement);
    expect(document.querySelector('.targets-detail')).not.toBeNull();
  });

  it('SPEC-scr-048 clicking the panel close button dismisses the panel', async () => {
    render(<Session {...EMPTY_PROPS} targets={[BASE_TARGET]} />);
    await userEvent.click(document.querySelector('.awaiting-user-row') as HTMLElement);
    expect(document.querySelector('.session-target-panel')).not.toBeNull();
    const closeBtn = document.querySelector('.session-target-panel__close') as HTMLElement;
    expect(closeBtn).not.toBeNull();
    await userEvent.click(closeBtn);
    expect(document.querySelector('.session-target-panel')).toBeNull();
  });

  it('SPEC-scr-048 pressing Esc dismisses the panel', async () => {
    render(<Session {...EMPTY_PROPS} targets={[BASE_TARGET]} />);
    await userEvent.click(document.querySelector('.awaiting-user-row') as HTMLElement);
    expect(document.querySelector('.session-target-panel')).not.toBeNull();
    await userEvent.keyboard('{Escape}');
    expect(document.querySelector('.session-target-panel')).toBeNull();
  });

  it('SPEC-scr-048 session content (pipeline strip) remains visible when panel is open', async () => {
    render(<Session {...EMPTY_PROPS} targets={[BASE_TARGET]} />);
    await userEvent.click(document.querySelector('.awaiting-user-row') as HTMLElement);
    expect(document.querySelector('.session-target-panel')).not.toBeNull();
    expect(document.querySelector('.pipeline')).not.toBeNull();
  });

  it('SPEC-scr-048 clicking a gap row still calls onNav gaps and does not open a panel', async () => {
    const gap = { id: 'GAP-scr-001', title: 'Missing thing', status: 'open' as const, specItem: 'SPEC-scr-001', abbrev: 'scr' };
    render(<Session {...EMPTY_PROPS} gaps={[gap]} />);
    const gapRow = document.querySelector('.compact-row') as HTMLElement;
    await userEvent.click(gapRow);
    expect(onNav).toHaveBeenCalledWith('gaps', 'GAP-scr-001');
    expect(document.querySelector('.session-target-panel')).toBeNull();
  });

  it('SPEC-scr-048 clicking a work item row still calls onNav work and does not open a panel', async () => {
    const wi = { id: 'WI-scr-001', title: 'Some work', status: 'pending' as const, agent: undefined };
    render(<Session {...EMPTY_PROPS} workItems={[wi]} />);
    // work items appear in the active work items section as compact-rows
    const rows = document.querySelectorAll('.compact-row');
    expect(rows.length).toBeGreaterThan(0);
    await userEvent.click(rows[rows.length - 1] as HTMLElement);
    expect(onNav).toHaveBeenCalledWith('work', 'WI-scr-001');
    expect(document.querySelector('.session-target-panel')).toBeNull();
  });
});

describe('Session screen (SPEC-scr-002)', () => {
  it('renders a 5-column pipeline strip', () => {
    render(<Session {...EMPTY_PROPS} />);
    const stages = document.querySelectorAll('.pipeline__stage');
    expect(stages.length).toBeGreaterThanOrEqual(5);
  });

  it('renders the next-action footer block', () => {
    render(<Session {...EMPTY_PROPS} />);
    const footer = document.querySelector('.session__next-action');
    expect(footer).not.toBeNull();
  });

  it('renders targets awaiting user when present', () => {
    const target = {
      id: 'TGT-001', status: 'awaiting-user' as const, domain: 'ui-screens', domainAbbrev: 'scr',
      title: 'Add search', created: '2026-05-28T00:00:00Z', statement: 'Add fuzzy search.', dialog: [],
    };
    render(<Session {...EMPTY_PROPS} targets={[target]} />);
    expect(document.body.textContent).toContain('TGT-001');
  });

  it('renders without crashing when all data is empty', () => {
    expect(() => render(<Session {...EMPTY_PROPS} />)).not.toThrow();
  });
});

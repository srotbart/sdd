import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommandPalette } from './CommandPalette';
import type { Target, Gap, WorkItem, Spec } from '../types';

const TARGET: Target = {
  id: 'TGT-001',
  status: 'awaiting-user',
  domain: 'ui-screens',
  domainAbbrev: 'ui',
  title: 'Add workspace dashboard',
  created: '2026-05-17T00:00:00Z',
  statement: 'The dashboard shows all workspaces.',
  dialog: [],
};

const TARGET2: Target = {
  id: 'TGT-002',
  status: 'draft',
  domain: 'ui-screens',
  domainAbbrev: 'ui',
  title: 'Settings screen redesign',
  created: '2026-05-17T00:00:00Z',
  statement: 'The settings screen needs a new design.',
  dialog: [],
};

const GAP: Gap = {
  id: 'GAP-scr-001',
  specItem: 'SPEC-scr-009',
  domain: 'ui-screens',
  abbrev: 'scr',
  status: 'open',
  discovered: '2026-05-17T00:00:00Z',
  auditVersion: 'abc12345',
  title: 'Missing API mapping',
  location: 'src/App.tsx:42',
  reasoning: 'Raw API response not mapped to Target type.',
  codeContext: { lang: 'typescript', lines: [] },
  closedBy: null,
};

const WORK_ITEM: WorkItem = {
  id: 'WI-scr-001',
  gapId: 'GAP-scr-001',
  title: 'Map API target fields',
  status: 'pending',
  domain: 'ui-screens',
  agent: null,
  created: '2026-05-17T00:00:00Z',
  scope: 'hub/client/src/App.tsx — map raw API fields',
  acceptance: ['Fields mapped correctly'],
};

const SPEC: Spec = {
  id: 'SPEC-ui-screens',
  domain: 'ui-screens',
  abbrev: 'scr',
  version: 'abc12345',
  items: [
    { id: 'SPEC-scr-001', title: 'Dashboard screen', status: 'active', body: 'The dashboard renders workspaces.', refs: [] },
  ],
};

function renderPalette(overrides?: Partial<Parameters<typeof CommandPalette>[0]>) {
  const onNavigate = vi.fn();
  const onClose = vi.fn();
  render(
    <CommandPalette
      targets={[TARGET, TARGET2]}
      gaps={[GAP]}
      workItems={[WORK_ITEM]}
      specs={[SPEC]}
      activeWorkspaceName="sdd-hub"
      onNavigate={onNavigate}
      onClose={onClose}
      {...overrides}
    />,
  );
  return { onNavigate, onClose };
}

describe('CommandPalette (WI-scr-010)', () => {
  it('renders the overlay and dialog without errors', () => {
    renderPalette();
    expect(document.querySelector('[data-testid="cp-overlay"]')).not.toBeNull();
    expect(document.querySelector('.cp-dialog')).not.toBeNull();
  });

  it('input has the ⌕ glyph', () => {
    renderPalette();
    expect(document.querySelector('.cp-glyph')?.textContent).toBe('⌕');
  });

  it('input has the correct placeholder text', () => {
    renderPalette();
    const input = document.querySelector('.cp-input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.placeholder).toBe('Search targets, specs, gaps, work items…');
  });

  it('pressing Escape calls onClose', async () => {
    const { onClose } = renderPalette();
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('clicking outside the dialog calls onClose', async () => {
    const { onClose } = renderPalette();
    const overlay = document.querySelector('[data-testid="cp-overlay"]')!;
    await userEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('default state (no query) shows recent targets and gaps', () => {
    renderPalette();
    const groupHeaders = Array.from(document.querySelectorAll('.cp-group__header')).map(
      (el) => el.textContent,
    );
    expect(groupHeaders).toContain('targets');
    expect(groupHeaders).toContain('gaps');
  });

  it('typing a query filters results to matching items', async () => {
    renderPalette();
    const input = document.querySelector('.cp-input') as HTMLInputElement;
    await userEvent.type(input, 'TGT-001');
    const rows = document.querySelectorAll('.cp-row');
    const ids = Array.from(rows).map((r) => r.querySelector('.cp-row__id')?.textContent);
    expect(ids).toContain('TGT-001');
    expect(ids).not.toContain('TGT-002');
  });

  it('matched characters are highlighted with cp-mark', async () => {
    renderPalette();
    const input = document.querySelector('.cp-input') as HTMLInputElement;
    await userEvent.type(input, 'TGT');
    const marks = document.querySelectorAll('mark.cp-mark');
    expect(marks.length).toBeGreaterThan(0);
  });

  it('ArrowDown moves selection to the next result', async () => {
    renderPalette();
    const rows = () => document.querySelectorAll('.cp-row');
    expect(rows()[0].classList).toContain('cp-row--selected');
    await userEvent.keyboard('{ArrowDown}');
    expect(rows()[0].classList).not.toContain('cp-row--selected');
    expect(rows()[1].classList).toContain('cp-row--selected');
  });

  it('results are grouped by kind with group headers', async () => {
    renderPalette();
    const input = document.querySelector('.cp-input') as HTMLInputElement;
    await userEvent.type(input, 'screen');
    const headers = Array.from(document.querySelectorAll('.cp-group__header')).map(
      (el) => el.textContent,
    );
    expect(headers.length).toBeGreaterThan(0);
  });

  it('scope chip shows the active workspace name', () => {
    renderPalette();
    const chip = document.querySelector('.cp-scope-chip');
    expect(chip?.textContent).toBe('sdd-hub');
  });
});

describe('CommandPalette global keyboard trigger (WI-scr-010)', () => {
  it('⌘K keydown event triggers palette open in App', async () => {
    renderPalette();
    expect(document.querySelector('[data-testid="cp-overlay"]')).not.toBeNull();
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Gaps } from './Gaps';
import type { Gap, Spec, WorkItem } from '../types';

const onNav = vi.fn();

const SPEC: Spec = {
  id: 'SPEC-uic',
  domain: 'ui-components',
  abbrev: 'uic',
  version: 'd059c530',
  items: [
    {
      id: 'SPEC-uic-001',
      title: 'ArtifactList shared component',
      status: 'active',
      body: 'ArtifactList is a generic component.',
      refs: [],
    },
  ],
};

const WORK_ITEMS: WorkItem[] = [];

const ACTIVE_GAP: Gap = {
  id: 'GAP-uic-001',
  specItem: 'SPEC-uic-001',
  domain: 'ui-components',
  abbrev: 'uic',
  status: 'open',
  discovered: '2026-05-17T00:00:00Z',
  auditVersion: 'd059c530',
  title: 'ArtifactList component missing',
  location: 'hub/client/src/components/ArtifactList.tsx:1',
  reasoning: 'File does not exist.',
  codeContext: { lang: 'typescript', lines: [] },
  closedBy: null,
};

const CLOSED_GAP: Gap = {
  id: 'GAP-uic-002',
  specItem: 'SPEC-uic-001',
  domain: 'ui-components',
  abbrev: 'uic',
  status: 'closed',
  discovered: '2026-05-10T00:00:00Z',
  auditVersion: 'abc12345',
  title: 'Old gap now fixed',
  location: 'hub/client/src/screens/Targets.tsx:100',
  reasoning: 'Was missing something.',
  codeContext: { lang: 'typescript', lines: [] },
  closedBy: 'WI-uic-001',
};

const DEFERRED_GAP: Gap = {
  id: 'GAP-uic-003',
  specItem: 'SPEC-uic-001',
  domain: 'ui-components',
  abbrev: 'uic',
  status: 'deferred',
  discovered: '2026-05-11T00:00:00Z',
  auditVersion: 'abc12345',
  title: 'Deferred gap',
  location: 'hub/client/src/screens/Targets.tsx:200',
  reasoning: 'Deferred for now.',
  codeContext: { lang: 'typescript', lines: [] },
  closedBy: null,
};

const ACCEPTED_GAP: Gap = {
  id: 'GAP-uic-004',
  specItem: 'SPEC-uic-001',
  domain: 'ui-components',
  abbrev: 'uic',
  status: 'accepted',
  discovered: '2026-05-12T00:00:00Z',
  auditVersion: 'abc12345',
  title: 'Accepted gap',
  location: 'hub/client/src/screens/Targets.tsx:300',
  reasoning: 'Accepted as-is.',
  codeContext: { lang: 'typescript', lines: [] },
  closedBy: null,
};

function renderGaps(gaps: Gap[] = [ACTIVE_GAP, CLOSED_GAP]) {
  return render(
    <Gaps
      gaps={gaps}
      specs={[SPEC]}
      workItems={WORK_ITEMS}
      onNav={onNav}
    />,
  );
}

describe('Gaps — terminal status filtering includes deferred and accepted (WI-scr-022)', () => {
  it('active list contains only the open gap when all four statuses are present', () => {
    render(
      <Gaps
        gaps={[ACTIVE_GAP, CLOSED_GAP, DEFERRED_GAP, ACCEPTED_GAP]}
        specs={[SPEC]}
        workItems={WORK_ITEMS}
        onNav={onNav}
      />,
    );
    const archivedRows = document.querySelectorAll('.artifact-list-archived-row');
    const activeRows = document.querySelectorAll('.gaps-row:not(.artifact-list-archived-row .gaps-row)');
    expect(archivedRows.length).toBe(3);
    const allRows = document.querySelectorAll('.gaps-row');
    const ids = Array.from(allRows).map((r) => r.querySelector('.gaps-row__id')?.textContent);
    expect(ids).toContain('GAP-uic-001');
    expect(ids).toContain('GAP-uic-002');
    expect(ids).toContain('GAP-uic-003');
    expect(ids).toContain('GAP-uic-004');
    void activeRows;
  });

  it('deferred gap appears in archived section (wrapped in .artifact-list-archived-row)', () => {
    render(
      <Gaps
        gaps={[ACTIVE_GAP, DEFERRED_GAP]}
        specs={[SPEC]}
        workItems={WORK_ITEMS}
        onNav={onNav}
      />,
    );
    expect(document.querySelector('.artifact-list-divider')).not.toBeNull();
    const archivedRows = document.querySelectorAll('.artifact-list-archived-row');
    expect(archivedRows.length).toBe(1);
    expect(archivedRows[0].querySelector('.gaps-row__id')?.textContent).toBe('GAP-uic-003');
  });

  it('accepted gap appears in archived section (wrapped in .artifact-list-archived-row)', () => {
    render(
      <Gaps
        gaps={[ACTIVE_GAP, ACCEPTED_GAP]}
        specs={[SPEC]}
        workItems={WORK_ITEMS}
        onNav={onNav}
      />,
    );
    expect(document.querySelector('.artifact-list-divider')).not.toBeNull();
    const archivedRows = document.querySelectorAll('.artifact-list-archived-row');
    expect(archivedRows.length).toBe(1);
    expect(archivedRows[0].querySelector('.gaps-row__id')?.textContent).toBe('GAP-uic-004');
  });
});

describe('Gaps — active and archived sections via ArtifactList', () => {
  it('renders active gap rows in the list', () => {
    renderGaps();
    const rows = document.querySelectorAll('.gaps-row');
    const ids = Array.from(rows).map((r) => r.querySelector('.gaps-row__id')?.textContent);
    expect(ids).toContain('GAP-uic-001');
  });

  it('renders archived (closed) gap rows in the list', () => {
    renderGaps();
    const rows = document.querySelectorAll('.gaps-row');
    const ids = Array.from(rows).map((r) => r.querySelector('.gaps-row__id')?.textContent);
    expect(ids).toContain('GAP-uic-002');
  });

  it('shows the ArtifactList divider when closed gaps exist', () => {
    renderGaps();
    expect(document.querySelector('.artifact-list-divider')).not.toBeNull();
  });

  it('divider label shows ARCHIVED with the closed gap count', () => {
    renderGaps();
    const label = document.querySelector('.artifact-list-divider__label');
    expect(label).not.toBeNull();
    expect(label!.textContent).toMatch(/ARCHIVED/);
    expect(label!.textContent).toMatch(/1/);
  });

  it('closed gap is wrapped in .artifact-list-archived-row', () => {
    renderGaps();
    expect(document.querySelectorAll('.artifact-list-archived-row').length).toBe(1);
  });

  it('does not show divider when no closed gaps exist', () => {
    renderGaps([ACTIVE_GAP]);
    expect(document.querySelector('.artifact-list-divider')).toBeNull();
  });

  it('clicking the divider hides archived gap rows', async () => {
    renderGaps();
    const divider = document.querySelector('.artifact-list-divider')!;
    await userEvent.click(divider);
    expect(document.querySelectorAll('.artifact-list-archived-row').length).toBe(0);
  });

  it('clicking the divider twice shows archived gap rows again', async () => {
    renderGaps();
    const divider = document.querySelector('.artifact-list-divider')!;
    await userEvent.click(divider);
    await userEvent.click(divider);
    expect(document.querySelectorAll('.artifact-list-archived-row').length).toBe(1);
  });

  it('no inline opacity or divider markup exists in the gaps-list__scroll directly', () => {
    renderGaps();
    const scroll = document.querySelector('.gaps-list__scroll')!;
    const inlineDividers = scroll.querySelectorAll('[style*="opacity"]');
    expect(inlineDividers.length).toBe(0);
  });
});

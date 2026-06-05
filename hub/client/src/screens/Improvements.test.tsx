import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Improvements } from './Improvements';
import type { Improvement } from '../types';

const OPEN_IMP: Improvement = {
  id: 'IMP-001',
  domain: 'ui-screens',
  effort: 'low',
  impact: 'high',
  status: 'open',
  title: 'Add keyboard navigation to spec list',
  body: 'Users should be able to navigate the spec list using arrow keys.',
  discovered: '2026-06-01T10:00:00Z',
};

const MEDIUM_IMP: Improvement = {
  id: 'IMP-002',
  domain: 'workflow',
  effort: 'medium',
  impact: 'medium',
  status: 'in-progress',
  title: 'Cache spec parse results',
  body: 'Caching would reduce repeated file reads.',
  discovered: '2026-06-02T12:00:00Z',
};

const DONE_IMP: Improvement = {
  id: 'IMP-003',
  domain: 'ui-screens',
  effort: 'low',
  impact: 'low',
  status: 'done',
  title: 'Improve empty state wording',
  body: 'Changed "no data" to more helpful messages.',
  discovered: '2026-05-20T08:00:00Z',
};

describe('SPEC-scr-050 Improvements screen — empty state', () => {
  it('renders the empty state message when improvements array is empty', () => {
    render(<Improvements improvements={[]} />);
    expect(document.querySelector('.improvements-empty')).not.toBeNull();
    expect(document.querySelector('.improvements-empty')!.textContent).toContain('no improvements found');
  });

  it('does not render any improvement rows when improvements array is empty', () => {
    render(<Improvements improvements={[]} />);
    expect(document.querySelectorAll('.improvements-row').length).toBe(0);
  });

  it('renders the improvements layout container', () => {
    render(<Improvements improvements={[]} />);
    expect(document.querySelector('.improvements-layout')).not.toBeNull();
  });
});

describe('SPEC-scr-050 Improvements screen — with data', () => {
  it('renders IMP-* ids in the list rows', () => {
    render(<Improvements improvements={[OPEN_IMP, MEDIUM_IMP]} />);
    const ids = Array.from(document.querySelectorAll('.improvements-row__id')).map((el) => el.textContent);
    expect(ids).toContain('IMP-001');
    expect(ids).toContain('IMP-002');
  });

  it('renders effort/impact badge on each row', () => {
    render(<Improvements improvements={[OPEN_IMP]} />);
    const badge = document.querySelector('.improvements-row__effort-impact');
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toContain('effort:low');
    expect(badge!.textContent).toContain('impact:high');
  });

  it('renders domain in the meta line', () => {
    render(<Improvements improvements={[OPEN_IMP]} />);
    const meta = document.querySelector('.improvements-row__meta');
    expect(meta).not.toBeNull();
    expect(meta!.textContent).toContain('ui-screens');
  });

  it('shows detail panel title when an improvement is selected (first auto-selected)', () => {
    render(<Improvements improvements={[OPEN_IMP, MEDIUM_IMP]} />);
    const title = document.querySelector('.improvement-detail__title');
    expect(title).not.toBeNull();
    expect(title!.textContent).toBe('Add keyboard navigation to spec list');
  });

  it('detail shows improvement id', () => {
    render(<Improvements improvements={[OPEN_IMP]} />);
    const id = document.querySelector('.improvement-detail__id');
    expect(id).not.toBeNull();
    expect(id!.textContent).toBe('IMP-001');
  });

  it('uses ArtifactList for domain filtering when multiple domains exist', () => {
    render(<Improvements improvements={[OPEN_IMP, MEDIUM_IMP]} />);
    expect(document.querySelector('.artifact-list-filter-bar')).not.toBeNull();
  });

  it('done improvements appear in the archived section', () => {
    render(<Improvements improvements={[OPEN_IMP, DONE_IMP]} />);
    const archivedRows = document.querySelectorAll('.artifact-list-archived-row');
    expect(archivedRows.length).toBeGreaterThan(0);
    const ids = Array.from(archivedRows).map((r) => r.querySelector('.improvements-row__id')?.textContent);
    expect(ids).toContain('IMP-003');
  });

  it('screen has no create/edit/engage buttons — read-only', () => {
    render(<Improvements improvements={[OPEN_IMP]} />);
    const buttons = Array.from(document.querySelectorAll('button'));
    const editButtons = buttons.filter((b) =>
      /create|edit|engage|new|delete/i.test(b.textContent ?? '')
    );
    expect(editButtons.length).toBe(0);
  });
});

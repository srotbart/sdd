import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Issues } from './Issues';
import type { Issue } from '../types';

const OPEN_ISSUE: Issue = {
  id: 'ISS-001',
  domain: 'ui-screens',
  severity: 'high',
  status: 'open',
  title: 'Missing error boundary in Gaps screen',
  body: 'The Gaps screen crashes when gap data is malformed.',
  discovered: '2026-06-01T10:00:00Z',
};

const MEDIUM_ISSUE: Issue = {
  id: 'ISS-002',
  domain: 'workflow',
  severity: 'medium',
  status: 'in-progress',
  title: 'Slow spec parsing on large repos',
  body: 'parseSpecs takes 5+ seconds on repos with 200+ spec items.',
  discovered: '2026-06-02T12:00:00Z',
};

const RESOLVED_ISSUE: Issue = {
  id: 'ISS-003',
  domain: 'ui-screens',
  severity: 'low',
  status: 'resolved',
  title: 'Fixed header overlap',
  body: 'Header was overlapping sidenav on small viewports.',
  discovered: '2026-05-20T08:00:00Z',
};

describe('SPEC-scr-050 Issues screen — empty state', () => {
  it('renders the empty state message when issues array is empty', () => {
    render(<Issues issues={[]} />);
    expect(document.querySelector('.issues-empty')).not.toBeNull();
    expect(document.querySelector('.issues-empty')!.textContent).toContain('no issues found');
  });

  it('does not render any issue rows when issues array is empty', () => {
    render(<Issues issues={[]} />);
    expect(document.querySelectorAll('.issues-row').length).toBe(0);
  });

  it('renders the issues layout container', () => {
    render(<Issues issues={[]} />);
    expect(document.querySelector('.issues-layout')).not.toBeNull();
  });
});

describe('SPEC-scr-050 Issues screen — with data', () => {
  it('renders ISS-* ids in the list rows', () => {
    render(<Issues issues={[OPEN_ISSUE, MEDIUM_ISSUE]} />);
    const ids = Array.from(document.querySelectorAll('.issues-row__id')).map((el) => el.textContent);
    expect(ids).toContain('ISS-001');
    expect(ids).toContain('ISS-002');
  });

  it('renders severity badge on each row', () => {
    render(<Issues issues={[OPEN_ISSUE]} />);
    const severity = document.querySelector('.issues-row__severity');
    expect(severity).not.toBeNull();
    expect(severity!.textContent).toBe('high');
  });

  it('renders domain in the meta line', () => {
    render(<Issues issues={[OPEN_ISSUE]} />);
    const meta = document.querySelector('.issues-row__meta');
    expect(meta).not.toBeNull();
    expect(meta!.textContent).toContain('ui-screens');
  });

  it('shows detail panel title when an issue is selected (first issue auto-selected)', () => {
    render(<Issues issues={[OPEN_ISSUE, MEDIUM_ISSUE]} />);
    const title = document.querySelector('.issue-detail__title');
    expect(title).not.toBeNull();
    expect(title!.textContent).toBe('Missing error boundary in Gaps screen');
  });

  it('detail shows severity in the header', () => {
    render(<Issues issues={[OPEN_ISSUE]} />);
    const severityBadges = document.querySelectorAll('.issues-row__severity');
    expect(severityBadges.length).toBeGreaterThan(0);
  });

  it('detail shows issue id', () => {
    render(<Issues issues={[OPEN_ISSUE]} />);
    const id = document.querySelector('.issue-detail__id');
    expect(id).not.toBeNull();
    expect(id!.textContent).toBe('ISS-001');
  });

  it('uses ArtifactList for domain filtering when multiple domains exist', () => {
    render(<Issues issues={[OPEN_ISSUE, MEDIUM_ISSUE]} />);
    expect(document.querySelector('.artifact-list-filter-bar')).not.toBeNull();
  });

  it('resolved issues appear in the archived section', () => {
    render(<Issues issues={[OPEN_ISSUE, RESOLVED_ISSUE]} />);
    const archivedRows = document.querySelectorAll('.artifact-list-archived-row');
    expect(archivedRows.length).toBeGreaterThan(0);
    const ids = Array.from(archivedRows).map((r) => r.querySelector('.issues-row__id')?.textContent);
    expect(ids).toContain('ISS-003');
  });

  it('screen has no create/edit/engage buttons — read-only', () => {
    render(<Issues issues={[OPEN_ISSUE]} />);
    const buttons = Array.from(document.querySelectorAll('button'));
    const editButtons = buttons.filter((b) =>
      /create|edit|engage|new|delete/i.test(b.textContent ?? '')
    );
    expect(editButtons.length).toBe(0);
  });
});

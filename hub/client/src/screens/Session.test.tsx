import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Session } from './Session';

const onNav = vi.fn();

const EMPTY_PROPS = {
  targets: [],
  specs: [],
  gaps: [],
  workItems: [],
  staleDomains: [],
  agents: [],
  onNav,
};

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

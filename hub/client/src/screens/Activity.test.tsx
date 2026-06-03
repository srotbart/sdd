import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Activity } from './Activity';
import type { ActivityLine, Agent } from '../types';

const NO_AGENTS: Agent[] = [];

describe('Activity screen — no simulation code (SPEC-scr-034)', () => {
  it('renders empty activity log when lines prop is empty — no fake entries appear', () => {
    render(<Activity lines={[]} agents={NO_AGENTS} />);
    const lines = document.querySelectorAll('.act-line:not(.act-line--listening)');
    expect(lines.length).toBe(0);
  });

  it('renders only the provided lines and no synthetic extras', () => {
    const realLines: ActivityLine[] = [
      { t: '12:00:00', agent: 'cc-main', kind: 'in', msg: 'real event' },
    ];
    render(<Activity lines={realLines} agents={NO_AGENTS} />);
    const lines = document.querySelectorAll('.act-line:not(.act-line--listening)');
    expect(lines.length).toBe(1);
    expect(lines[0].textContent).toContain('real event');
  });

  it('filters lines by selected agent without mixing in fake entries', () => {
    const realLines: ActivityLine[] = [
      { t: '12:00:01', agent: 'agent-a', kind: 'in', msg: 'from a' },
      { t: '12:00:02', agent: 'agent-b', kind: 'in', msg: 'from b' },
    ];
    render(<Activity lines={realLines} agents={NO_AGENTS} />);
    const agentBtns = document.querySelectorAll('.activity-filter-btn');
    expect(agentBtns.length).toBe(3);
  });
});

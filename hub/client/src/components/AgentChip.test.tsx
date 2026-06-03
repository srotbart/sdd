import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AgentChip } from './AgentChip';
import type { Agent } from '../types';

const AGENT: Agent = {
  id: 'agt-1',
  initials: 'CA',
  name: 'claude-a',
  host: 'localhost',
  status: 'idle',
  pid: 1,
};

describe('AgentChip null/undefined handling (WI-uic-007)', () => {
  it('renders "unassigned" text when agent is null', () => {
    render(<AgentChip agent={null} />);
    expect(document.body.textContent).toContain('unassigned');
    expect(document.querySelector('.agent-chip--unassigned')).not.toBeNull();
  });

  it('renders "unassigned" text when agent is undefined', () => {
    render(<AgentChip agent={undefined} />);
    expect(document.body.textContent).toContain('unassigned');
    expect(document.querySelector('.agent-chip--unassigned')).not.toBeNull();
  });

  it('renders agent initials and name when agent is a valid Agent', () => {
    render(<AgentChip agent={AGENT} />);
    expect(document.querySelector('.agent-chip__av')?.textContent).toBe('CA');
    expect(document.querySelector('.agent-chip__name')?.textContent).toBe('claude-a');
  });
});

describe('AgentChip avatar color derived from agent.id (WI-uic-015)', () => {
  it('two agents with the same status but different IDs render different avatar classes', () => {
    const agentA: Agent = { id: 'agt-aaa', initials: 'AA', name: 'alpha', host: 'h', status: 'idle', pid: 1 };
    const agentB: Agent = { id: 'zzz-zzz', initials: 'ZZ', name: 'zeta', host: 'h', status: 'idle', pid: 2 };

    const { container: cA } = render(<AgentChip agent={agentA} />);
    const classA = cA.querySelector('.agent-chip__av')!.className;
    cA.remove();

    const { container: cB } = render(<AgentChip agent={agentB} />);
    const classB = cB.querySelector('.agent-chip__av')!.className;

    expect(classA).not.toBe(classB);
  });

  it('the same agent ID always produces the same avatar class regardless of status', () => {
    const agentIdle: Agent = { id: 'agt-stable', initials: 'ST', name: 'stable', host: 'h', status: 'idle', pid: 1 };
    const agentBusy: Agent = { ...agentIdle, status: 'busy' };

    const { container: c1 } = render(<AgentChip agent={agentIdle} />);
    const class1 = c1.querySelector('.agent-chip__av')!.className;
    c1.remove();

    const { container: c2 } = render(<AgentChip agent={agentBusy} />);
    const class2 = c2.querySelector('.agent-chip__av')!.className;

    expect(class1).toBe(class2);
  });

  it('avatar class is one of the palette classes (c0–c5), not a status class', () => {
    render(<AgentChip agent={AGENT} />);
    const av = document.querySelector('.agent-chip__av')!;
    const paletteRe = /agent-chip__av--c[0-5]/;
    expect(paletteRe.test(av.className)).toBe(true);
    expect(av.className).not.toContain('busy');
    expect(av.className).not.toContain('idle');
  });
});

describe('AgentChip size prop (SPEC-uic-007)', () => {
  it('applies agent-chip--sm class when size="sm"', () => {
    render(<AgentChip agent={AGENT} size="sm" />);
    const chip = document.querySelector('.agent-chip');
    expect(chip).not.toBeNull();
    expect(chip!.classList.contains('agent-chip--sm')).toBe(true);
  });

  it('does not apply agent-chip--sm class when size is omitted', () => {
    render(<AgentChip agent={AGENT} />);
    const chip = document.querySelector('.agent-chip');
    expect(chip!.classList.contains('agent-chip--sm')).toBe(false);
  });

  it('renders agent-chip--unassigned class when agent is null', () => {
    render(<AgentChip agent={null} />);
    expect(document.querySelector('.agent-chip--unassigned')).not.toBeNull();
  });
});

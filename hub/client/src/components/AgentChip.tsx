import './AgentChip.css';
import type { Agent } from '../types';

interface AgentChipProps {
  agent: Agent | null | undefined;
  size?: 'sm' | 'md';
}

const PALETTE_SIZE = 6;

function idColorClass(id: string): string {
  let sum = 0;
  for (let i = 0; i < id.length; i++) {
    sum += id.charCodeAt(i);
  }
  return `agent-chip__av--c${sum % PALETTE_SIZE}`;
}

export function AgentChip({ agent, size }: AgentChipProps) {
  if (!agent) {
    return <span className="agent-chip agent-chip--unassigned">unassigned</span>;
  }
  const sizeClass = size === 'sm' ? ' agent-chip--sm' : '';
  const colorClass = idColorClass(agent.id);
  return (
    <span className={`agent-chip${sizeClass}`}>
      <span className={`agent-chip__av ${colorClass}`}>
        {agent.initials}
      </span>
      <span className="agent-chip__name">{agent.name}</span>
    </span>
  );
}

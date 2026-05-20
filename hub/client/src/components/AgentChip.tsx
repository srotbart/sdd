import './AgentChip.css';
import type { Agent } from '../types';

interface AgentChipProps {
  agent: Agent;
}

export function AgentChip({ agent }: AgentChipProps) {
  return (
    <span className="agent-chip">
      <span className={`agent-chip__av agent-chip__av--${agent.status}`}>
        {agent.initials}
      </span>
      <span className="agent-chip__name">{agent.name}</span>
    </span>
  );
}

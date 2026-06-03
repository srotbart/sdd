import { useState } from 'react';
import './Activity.css';
import type { ActivityLine, Agent } from '../types';

interface ActivityProps {
  lines: ActivityLine[];
  agents: Agent[];
}

export function Activity({ lines, agents }: ActivityProps) {
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [paused, setPaused] = useState<boolean>(false);

  const filtered =
    filterAgent === 'all' ? lines : lines.filter((l) => l.agent === filterAgent);

  const uniqueAgents = ['all', ...Array.from(new Set(lines.map((l) => l.agent)))];

  const busyCount = agents.filter((a) => a.status === 'busy').length;

  return (
    <div className="activity-shell">
      <div className="activity-toolbar">
        <div className="activity-toolbar__left">
          <button
            className={`activity-toggle${paused ? '' : ' activity-toggle--live'}`}
            onClick={() => setPaused((p) => !p)}
          >
            <span className={`activity-toggle__dot${paused ? '' : ' activity-toggle__dot--live'}`} />
            {paused ? 'paused' : 'live'}
          </button>
          {!paused && (
            <span className="activity-agent-count">
              {busyCount} active
            </span>
          )}
        </div>
        <button className="activity-export-btn">export log</button>
      </div>

      <div className="activity-filter-bar">
        <span className="activity-filter-bar__label">agent</span>
        {uniqueAgents.map((a) => (
          <button
            key={a}
            onClick={() => setFilterAgent(a)}
            className={`activity-filter-btn${filterAgent === a ? ' activity-filter-btn--active' : ''}`}
          >
            {a}
          </button>
        ))}
      </div>

      <div className="activity-stream">
        {filtered.map((line, i) => (
          <div key={i} className={`act-line act-line--${line.kind ?? 'in'}`}>
            <span className="act-line__t">{line.t}</span>
            <span className="act-line__a">{line.agent}</span>
            <span
              className="act-line__m"
              dangerouslySetInnerHTML={{ __html: line.msg }}
            />
          </div>
        ))}
        {!paused && (
          <div className="act-line act-line--listening">
            <span className="act-line__t">···</span>
            <span className="act-line__a">listening</span>
            <span className="act-line__m">
              <span className="act-caret" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

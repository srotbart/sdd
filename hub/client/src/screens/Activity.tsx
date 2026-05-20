import { useState, useEffect, useMemo } from 'react';
import './Activity.css';
import type { ActivityLine, Agent } from '../types';

interface ActivityProps {
  lines: ActivityLine[];
  agents: Record<string, Agent>;
}

const LIVE_EXTRAS: Omit<ActivityLine, 't'>[] = [
  { agent: 'cc-main',    kind: 'in',   msg: 'wrote <span class="act-ref">tests/auth/test_admin.py:24</span> — adding MFA assertion' },
  { agent: 'cc-main',    kind: 'in',   msg: 'running <b>pytest -k mfa_present</b>' },
  { agent: 'cc-audit',   kind: 'in',   msg: 'edited <span class="act-ref">src/jobs/transcribe.py:204</span>' },
  { agent: 'cc-billing', kind: 'note', msg: 'still blocked on TGT-014' },
  { agent: 'cc-main',    kind: 'in',   msg: '<b>1 test passed</b>, 0 failed' },
];

export function Activity({ lines, agents }: ActivityProps) {
  const [filterAgent, setFilterAgent] = useState<string>('all');
  const [paused, setPaused] = useState<boolean>(false);
  const [tickCount, setTickCount] = useState<number>(0);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setTickCount((c) => c + 1), 6500);
    return () => clearInterval(t);
  }, [paused]);

  const liveExtras = useMemo((): ActivityLine[] => {
    return Array.from({ length: tickCount }).map((_, i) => {
      const o = LIVE_EXTRAS[i % LIVE_EXTRAS.length];
      const now = new Date();
      const t = new Date(now.getTime() + (i + 1) * 6500)
        .toISOString()
        .slice(11, 19);
      return { ...o, t };
    }).reverse();
  }, [tickCount]);

  const allLines: ActivityLine[] = [...liveExtras, ...lines];
  const filtered =
    filterAgent === 'all' ? allLines : allLines.filter((l) => l.agent === filterAgent);

  const uniqueAgents = ['all', ...Array.from(new Set(lines.map((l) => l.agent)))];

  const busyCount = Object.values(agents).filter((a) => a.status === 'busy').length;

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

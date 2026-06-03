import { useState, useEffect } from 'react';
import './Header.css';

interface HeaderProps {
  breadcrumb: string[];
  agentCount: number;
  hubAddress: string;
}

export function Header({ breadcrumb, agentCount, hubAddress }: HeaderProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toISOString().slice(11, 16) + ' UTC';

  return (
    <header className="header">
      <div className="header-left">
        <span className="header-logo">sdd-hub</span>
        <nav className="header-breadcrumb">
          {breadcrumb.map((crumb, i) => (
            <span key={i}>
              {i > 0 && <span className="header-sep">/</span>}
              <span className="header-crumb">{crumb}</span>
            </span>
          ))}
        </nav>
      </div>
      <div className="header-right">
        <span className="header-meta">
          <span className="header-dot" />
          {agentCount} {agentCount === 1 ? 'agent' : 'agents'}
        </span>
        <span className="header-meta">hub {hubAddress}</span>
        <span className="header-meta header-mono">{dateStr} · {timeStr}</span>
      </div>
    </header>
  );
}

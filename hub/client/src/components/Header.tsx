import { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import type { ThemeMode } from '../hooks/useTheme';
import './Header.css';

interface HeaderProps {
  breadcrumb: string[];
  agentCount: number;
  hubAddress: string;
}

const THEME_CYCLE: ThemeMode[] = ['light', 'dark', 'system'];
const THEME_LABEL: Record<ThemeMode, string> = { light: '☀', dark: '☾', system: '⊙' };

export function Header({ breadcrumb, agentCount, hubAddress }: HeaderProps) {
  const [now, setNow] = useState(() => new Date());
  const { mode, setMode } = useTheme();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toISOString().slice(11, 16) + ' UTC';

  function cycleTheme() {
    const idx = THEME_CYCLE.indexOf(mode);
    setMode(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  }

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
        <button
          className="header-theme-toggle"
          aria-label={`Theme: ${mode}`}
          title={`Theme: ${mode} — click to cycle`}
          onClick={cycleTheme}
        >
          {THEME_LABEL[mode]}
        </button>
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

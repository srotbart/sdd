/* ============================================================
   Shared UI primitives
   ============================================================ */

const { useState, useEffect, useRef, useMemo, useCallback, Fragment } = React;

/* Tiny class joiner */
const cx = (...xs) => xs.filter(Boolean).join(' ');

/* Status pill — uniform across screens */
function StatusPill({ status, label }) {
  const map = {
    'awaiting-user':  ['open',     'awaiting user'],
    'awaiting-agent': ['progress', 'awaiting agent'],
    'ready':          ['phosphor', 'ready'],
    'draft':          ['draft',    'draft'],
    'accepted':       ['done',     'accepted'],
    'open':           ['open',     'open'],
    'pending':        ['draft',    'pending'],
    'in-progress':    ['progress', 'in progress'],
    'blocked':        ['blocked',  'blocked'],
    'done':           ['done',     'done'],
    'closed':         ['done',     'closed'],
    'active':         ['phosphor', 'active'],
    'stale':          ['stale',    'stale'],
  };
  const [cls, txt] = map[status] || ['draft', status];
  return (
    <span className={`pill ${cls}`}>
      <span className="led"></span>
      {label || txt}
    </span>
  );
}

function AgentChip({ agentId }) {
  const a = window.SDD.AGENTS[agentId];
  if (!a) return null;
  return (
    <span className="agent-chip">
      <span className={`av ${a.status}`}>{a.initials}</span>
      <span>{a.name}</span>
    </span>
  );
}

function AgentDot({ agentId, size = 18 }) {
  const a = window.SDD.AGENTS[agentId];
  if (!a) return null;
  return (
    <span
      className={`av ${a.status}`}
      title={`${a.name} · ${a.status}`}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: a.status === 'busy' ? 'var(--phosphor-dim)' : 'var(--text-3)',
        color: a.status === 'busy' ? '#062712' : 'var(--bg-0)',
        fontSize: Math.round(size * 0.5),
        fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>{a.initials}</span>
  );
}

function HSection({ children, count }) {
  return (
    <div className="h-section">
      <span>{children}</span>
      {count != null && <span className="ct">{count}</span>}
      <span className="rule"></span>
    </div>
  );
}

function Card({ children, head, pad = false }) {
  return (
    <div className="card">
      {head && <div className="head">{head}</div>}
      <div className={pad ? 'card-pad' : ''}>{children}</div>
    </div>
  );
}

function Toolbar({ title, glyph, sub, actions }) {
  return (
    <div className="toolbar">
      <h1>
        {glyph && <span className="glyph">{glyph}</span>}
        <span>{title}</span>
        {sub && <span className="sub">— {sub}</span>}
      </h1>
      <div className="actions">{actions}</div>
    </div>
  );
}

function Empty({ glyph, children }) {
  return (
    <div className="empty">
      {glyph && <div className="glyph">{glyph}</div>}
      <div>{children}</div>
    </div>
  );
}

function CodeView({ context }) {
  if (!context) return null;
  return (
    <div className="codeview">
      {context.lines.map((ln, i) => (
        <div key={i} className={`ln ${ln.hl ? 'hl' : ''}`}>
          <span className="n">{ln.n}</span>
          <span className="src" dangerouslySetInnerHTML={{ __html: highlightPython(ln.src) }}></span>
        </div>
      ))}
    </div>
  );
}

/* Tiny python-ish syntax highlight (cosmetic) */
function highlightPython(src) {
  if (!src) return '&nbsp;';
  // escape
  let s = src.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // comments
  s = s.replace(/(#.*$)/, '<span class="com">$1</span>');
  // strings
  s = s.replace(/("[^"]*"|'[^']*')/g, '<span class="str">$1</span>');
  // keywords
  s = s.replace(/\b(def|return|with|for|in|if|not|None|True|False|import|from|as|class|raise|while|else|elif|try|except|finally|pass|yield|lambda|async|await)\b/g,
                '<span class="kw">$1</span>');
  // function calls
  s = s.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\(/g, '<span class="fn">$1</span>(');
  // numbers
  s = s.replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
  return s;
}

/* Toggle */
function Toggle({ on, onChange, label }) {
  return (
    <div className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange?.(!on)}>
      <span className="track"></span>
      {label && <span style={{ fontSize: 12, color: 'var(--text-1)' }}>{label}</span>}
    </div>
  );
}

/* SubTabs */
function SubTabs({ tabs, active, onChange }) {
  return (
    <div className="subtabs">
      {tabs.map(t => (
        <div key={t.id}
             className={`t ${active === t.id ? 'active' : ''}`}
             onClick={() => onChange(t.id)}>
          {t.label}
          {t.count != null && <span style={{ marginLeft: 6, color: 'var(--text-3)' }}>{t.count}</span>}
        </div>
      ))}
    </div>
  );
}

/* Pipeline header (used on session start + workspace overview) */
function Pipeline({ stages, activeIdx }) {
  return (
    <div className="pipeline">
      {stages.map((s, i) => (
        <div key={s.key}
             className={cx('stage', activeIdx === i && 'active', (s.n === 0 || s.n == null) && 'empty')}>
          <b>{s.n != null ? s.n : '·'}</b>
          {s.label}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  cx, StatusPill, AgentChip, AgentDot, HSection, Card, Toolbar, Empty,
  CodeView, Toggle, SubTabs, Pipeline,
});

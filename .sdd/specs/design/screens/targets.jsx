/* ============================================================
   Workspace: Targets list + Target negotiation detail
   ============================================================ */

function TargetsView({ initialTargetId, onNav }) {
  const { TARGETS, fmtAgo } = window.SDD;
  const [activeId, setActiveId] = useState(initialTargetId || TARGETS[0].id);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all'
    ? TARGETS
    : TARGETS.filter(t => t.status === filter);

  const active = TARGETS.find(t => t.id === activeId);

  const statusFilters = [
    { id: 'all', label: 'all', count: TARGETS.length },
    { id: 'awaiting-user',  label: 'awaiting you',   count: TARGETS.filter(t => t.status === 'awaiting-user').length },
    { id: 'awaiting-agent', label: 'awaiting agent', count: TARGETS.filter(t => t.status === 'awaiting-agent').length },
    { id: 'ready',          label: 'ready',          count: TARGETS.filter(t => t.status === 'ready').length },
    { id: 'draft',          label: 'draft',          count: TARGETS.filter(t => t.status === 'draft').length },
  ];

  return (
    <React.Fragment>
      <Toolbar
        title="targets"
        glyph="▸"
        sub="declared intent, negotiated to spec"
        actions={
          <React.Fragment>
            <button className="btn ghost">archive</button>
            <button className="btn primary">+ new target</button>
          </React.Fragment>
        }
      />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '380px 1fr', overflow: 'hidden' }}>
        {/* List pane */}
        <div style={{
          background: 'var(--panel)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '10px 12px',
            display: 'flex', gap: 4, alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}>
            {statusFilters.map(f => (
              <button key={f.id}
                      className="btn ghost"
                      onClick={() => setFilter(f.id)}
                      style={{
                        fontSize: 11,
                        padding: '3px 8px',
                        color: filter === f.id ? 'var(--phosphor)' : 'var(--text-2)',
                        background: filter === f.id ? 'var(--accent-tint-3)' : 'transparent',
                      }}>
                {f.label} <span style={{ color: 'var(--text-3)', marginLeft: 4 }}>{f.count}</span>
              </button>
            ))}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.map(t => (
              <div key={t.id}
                   onClick={() => setActiveId(t.id)}
                   style={{
                     padding: '12px 14px',
                     borderBottom: '1px solid var(--border)',
                     cursor: 'pointer',
                     background: activeId === t.id ? 'var(--panel-3)' : 'transparent',
                     borderLeft: activeId === t.id ? '2px solid var(--phosphor)' : '2px solid transparent',
                   }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="id phosphor" style={{ fontSize: 11 }}>{t.id}</span>
                  <StatusPill status={t.status} />
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-3)' }}>
                    {fmtAgo(t.created)} ago
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--text-0)', marginBottom: 4, lineHeight: 1.4 }}>
                  {t.title || <span style={{ color: 'var(--text-3)' }}>(unnamed draft)</span>}
                </div>
                <div style={{ fontSize: 10.5, color: 'var(--text-2)' }}>
                  [{t.domain}]
                  {t.dialog.length > 0 && <> · {t.dialog.length} turn{t.dialog.length === 1 ? '' : 's'}</>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail pane */}
        {active ? (
          <TargetDetail target={active} onNav={onNav} />
        ) : (
          <div className="scroll p-18"><Empty>select a target</Empty></div>
        )}
      </div>
    </React.Fragment>
  );
}

/* -------------------------------------------------------------
   Target Detail — negotiation surface
   ------------------------------------------------------------- */

function TargetDetail({ target, onNav }) {
  const [composer, setComposer] = useState('');
  const [editingStatement, setEditingStatement] = useState(false);

  // Action label depends on status
  const action = {
    'awaiting-user':  { label: 'send reply',     hint: 'sets status → awaiting-agent', primary: true },
    'awaiting-agent': { label: 'add note',       hint: 'agent will respond next session' },
    'ready':          { label: 'reconcile with spec', hint: 'run /sdd:target-engage', primary: true },
    'draft':          { label: 'submit for response', hint: 'sets status → awaiting-agent', primary: true },
  }[target.status] || { label: 'send', hint: '' };

  return (
    <div className="scroll" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '18px 24px 14px',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(to bottom, var(--panel), transparent)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span className="id phosphor" style={{ fontSize: 13 }}>{target.id}</span>
          <StatusPill status={target.status} />
          <span className="pill"><span className="led"></span>{target.domain}</span>
          <span style={{ marginLeft: 'auto', color: 'var(--text-3)', fontSize: 11 }}>
            created {target.created.split('T')[0]}
          </span>
        </div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: 'var(--text-0)', lineHeight: 1.3 }}>
          {target.title || <span style={{ color: 'var(--text-3)' }}>(unnamed draft)</span>}
        </h2>
      </div>

      {/* Conflict warning hook */}
      {target.status === 'ready' && (
        <div style={{
          padding: '10px 24px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--accent-tint-2)',
          color: 'var(--phosphor)',
          fontSize: 12,
          display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <span>✓</span>
          <span>target is settled. run <span className="code">/sdd:target-engage {target.id}</span> to reconcile with <span className="code">SPEC-{target.domainAbbrev}</span>.</span>
          <button className="btn primary" style={{ marginLeft: 'auto' }}>fold into spec →</button>
        </div>
      )}

      {/* Current statement */}
      {target.statement && (
        <div style={{ padding: '18px 24px 8px', maxWidth: 820, margin: '0 auto', width: '100%' }}>
          <div className="statement">
            <div className="label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>current statement</span>
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button className="btn ghost" style={{ fontSize: 10, padding: '2px 6px' }}
                        onClick={() => setEditingStatement(!editingStatement)}>
                  {editingStatement ? 'cancel' : 'edit'}
                </button>
              </span>
            </div>
            {editingStatement ? (
              <textarea
                defaultValue={target.statement}
                style={{
                  width: '100%', marginTop: 6,
                  background: 'var(--panel-2)', border: '1px solid var(--border-2)',
                  borderRadius: 'var(--r-2)', padding: '8px 10px',
                  color: 'var(--text-0)', fontSize: 13, fontFamily: 'var(--mono)',
                  resize: 'vertical', minHeight: 100,
                }}
              />
            ) : (
              <div className="text">{target.statement}</div>
            )}
          </div>
        </div>
      )}

      {/* Dialog */}
      <div className="dlg">
        {target.dialog.length === 0 && (
          <Empty glyph="◌">no dialog yet — describe your intent in current statement, then submit for agent response</Empty>
        )}
        {target.dialog.map((turn, i) => (
          <div key={i} className={`turn ${turn.who}`}>
            <div className="who">
              {turn.who === 'agent' ? 'AGENT' : 'YOU'}
              <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>round&nbsp;{Math.floor(i/2) + 1}</div>
            </div>
            <div className="bubble">
              <span className="timestamp">{turn.date} · {turn.who === 'agent' ? 'cc-main' : 'you'}</span>
              <TurnBody text={turn.text} />
            </div>
          </div>
        ))}

        {/* Composer */}
        <div className="composer">
          <textarea
            value={composer}
            onChange={e => setComposer(e.target.value)}
            placeholder={
              target.status === 'awaiting-user'
                ? "answer the agent's questions, or revise the current statement…"
                : target.status === 'draft'
                  ? "describe your intent in plain language…"
                  : "add a note…"
            }
          />
          <div className="row">
            <span className="hint">
              <span className="kbd">⌘</span> + <span className="kbd">↵</span> to send
            </span>
            <span style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              {target.status === 'awaiting-user' && (
                <button className="btn ghost" title="settle without further questions">
                  mark ready
                </button>
              )}
              <button className={`btn ${action.primary ? 'primary' : ''}`}>
                {action.label}
              </button>
            </span>
          </div>
          <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-3)' }}>{action.hint}</div>
        </div>
      </div>
    </div>
  );
}

/* Render dialog text — convert >blockquote and code spans */
function TurnBody({ text }) {
  // Convert to lightweight HTML
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // blockquote: lines starting with &gt;
  html = html.replace(/(?:^|\n)(?:&gt;\s.+\n?)+/g, m => {
    const inner = m.split('\n').filter(Boolean).map(l => l.replace(/^&gt;\s?/, '')).join(' ');
    return `\n<blockquote>${inner}</blockquote>`;
  });
  // backticks
  html = html.replace(/`([^`]+)`/g, '<span class="code">$1</span>');
  // numbered list lines
  html = html.replace(/(\n|^)(\d+)\.\s(.+)/g, '$1<div style="margin-left: 18px"><span style="color: var(--text-3); margin-right: 6px">$2.</span>$3</div>');
  // line breaks
  html = html.replace(/\n/g, '<br/>');
  return <span dangerouslySetInnerHTML={{ __html: html }}></span>;
}

window.TargetsView = TargetsView;

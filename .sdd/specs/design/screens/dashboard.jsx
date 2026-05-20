/* ============================================================
   Hub Dashboard — overview of all workspaces
   ============================================================ */

function HubDashboard({ onOpenWorkspace }) {
  const { WORKSPACES, AGENTS, ACTIVITY, fmtAgo } = window.SDD;

  const totals = WORKSPACES.reduce((t, w) => {
    t.targets += w.counts.targetsAwaitingUser + w.counts.targetsAwaitingAgent + w.counts.targetsReady + w.counts.targetsDraft;
    t.awaitingUser += w.counts.targetsAwaitingUser;
    t.openGaps += w.counts.openGaps;
    t.work += w.counts.workPending + w.counts.workInProgress + w.counts.workBlocked;
    t.stale += w.counts.staleAuditDomains;
    return t;
  }, { targets: 0, awaitingUser: 0, openGaps: 0, work: 0, stale: 0 });

  const busyAgents = Object.values(AGENTS).filter(a => a.status === 'busy');

  return (
    <React.Fragment>
      <Toolbar
        title="hub"
        glyph="●"
        sub={`${WORKSPACES.length} workspaces, ${busyAgents.length} active agent${busyAgents.length === 1 ? '' : 's'}`}
        actions={
          <React.Fragment>
            <button className="btn ghost">
              <span style={{ color: 'var(--text-3)' }}>⌘</span>K · search
            </button>
            <button className="btn primary">+ attach workspace</button>
          </React.Fragment>
        }
      />

      <div className="scroll">
        <div className="p-18">

          {/* Top summary strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 22 }}>
            <SummaryStat label="awaiting your input" value={totals.awaitingUser} accent="warn"
                         hint={totals.awaitingUser > 0 ? 'targets need a reply' : 'all clear'} />
            <SummaryStat label="open targets"    value={totals.targets} />
            <SummaryStat label="open gaps"       value={totals.openGaps} />
            <SummaryStat label="active work"     value={totals.work} />
            <SummaryStat label="stale audits"    value={totals.stale} accent={totals.stale ? 'warn' : null} />
          </div>

          <HSection count={WORKSPACES.length}>workspaces</HSection>

          <div className="tiles">
            {WORKSPACES.map(w => (
              <WorkspaceTile key={w.id} ws={w}
                             onOpen={() => onOpenWorkspace(w.id)} />
            ))}
          </div>

          <div style={{ marginTop: 26 }}>
            <HSection>agent activity (last 30m)</HSection>
            <div className="card">
              <div className="stream" style={{ padding: '10px 16px' }}>
                {ACTIVITY.slice(0, 10).map((line, i) => (
                  <div key={i} className={`line ${line.kind}`}>
                    <span className="t">{line.t}</span>
                    <span className="a">{line.agent}</span>
                    <span className="m" dangerouslySetInnerHTML={{ __html: line.msg }}></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </React.Fragment>
  );
}

function SummaryStat({ label, value, accent, hint }) {
  return (
    <div className="card card-pad">
      <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
        {label}
      </div>
      <div style={{
        fontSize: 30, fontWeight: 500,
        color: accent === 'warn' && value > 0 ? 'var(--st-open)' :
               accent === 'bad' && value > 0 ? 'var(--st-blocked)' :
               value > 0 ? 'var(--text-0)' : 'var(--text-2)',
        marginTop: 6, marginBottom: 2,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      {hint && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{hint}</div>}
    </div>
  );
}

function WorkspaceTile({ ws, onOpen }) {
  const { fmtAgo, AGENTS } = window.SDD;
  const isBusy = ws.agents.some(a => AGENTS[a]?.status === 'busy');
  const activityFresh = (new Date(window.SDD.NOW) - new Date(ws.lastActivity)) < 5 * 60 * 1000;
  const blocked = ws.counts.workBlocked;
  const stale = ws.counts.staleAuditDomains;

  return (
    <div className={cx('tile', isBusy && 'active')} onClick={onOpen}>
      <div className="head">
        <span className="dot" style={{
          background: isBusy ? 'var(--phosphor)' : 'var(--text-3)',
          boxShadow: isBusy ? '0 0 8px var(--phosphor-glow)' : 'none',
        }}></span>
        <span className="name">{ws.name}</span>
        {ws.pinned && <span className="id" style={{ fontSize: 10 }}>★</span>}
        {stale > 0 && <span className="pill stale" title="stale audit"><span className="led"></span>stale</span>}
      </div>
      <div className="path">{ws.path}</div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
        {ws.agents.length === 0 ? (
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>no agents attached</span>
        ) : (
          ws.agents.map(id => <AgentChip key={id} agentId={id} />)
        )}
      </div>

      <div className="activity" style={{ marginTop: 10 }}>
        <span className={cx('dot', activityFresh && 'live')}></span>
        <span>
          {isBusy ? 'active now' : `last activity ${fmtAgo(ws.lastActivity)} ago`}
        </span>
      </div>

      <div className="stats">
        <div className={cx('s', ws.counts.targetsAwaitingUser > 0 && 'warn')}>
          <b>{ws.counts.targetsAwaitingUser}</b>
          await user
        </div>
        <div className={cx('s', ws.counts.openGaps > 0 && 'has')}>
          <b>{ws.counts.openGaps}</b>
          gaps
        </div>
        <div className={cx('s', ws.counts.workInProgress > 0 && 'has')}>
          <b>{ws.counts.workInProgress}</b>
          in&nbsp;progress
        </div>
        <div className={cx('s', blocked > 0 && 'bad')}>
          <b>{blocked}</b>
          blocked
        </div>
      </div>
    </div>
  );
}

window.HubDashboard = HubDashboard;

/* ============================================================
   App Shell — sidebar, workspace + nav, routing
   ============================================================ */

function App() {
  // Routes: { scope: 'hub' | 'workspace', wsId, tab, focusId }
  const [route, setRoute] = useState({ scope: 'workspace', wsId: 'plover', tab: 'session', focusId: null });

  const goHub = () => setRoute({ scope: 'hub' });
  const goWs = (wsId, tab = 'session', focusId = null) => setRoute({ scope: 'workspace', wsId, tab, focusId });
  const navWithin = (tab, focusId) => setRoute(r => ({ ...r, tab, focusId }));

  const ws = window.SDD.WORKSPACES.find(w => w.id === route.wsId);
  const isHub = route.scope === 'hub';

  const tabs = ws ? [
    { id: 'session',  label: 'session',     count: ws.counts.targetsAwaitingUser || null, alert: ws.counts.targetsAwaitingUser > 0 },
    { id: 'targets',  label: 'targets',     count: ws.counts.targetsAwaitingUser + ws.counts.targetsAwaitingAgent + ws.counts.targetsReady + ws.counts.targetsDraft },
    { id: 'specs',    label: 'specs',       count: ws.counts.specs },
    { id: 'gaps',     label: 'gaps',        count: ws.counts.openGaps || null },
    { id: 'work',     label: 'work items',  count: ws.counts.workInProgress + ws.counts.workPending + ws.counts.workBlocked },
    { id: 'activity', label: 'activity' },
    { id: 'settings', label: 'settings' },
  ] : [];

  return (
    <div className="app">

      {/* Titlebar */}
      <div className="titlebar">
        <div className="brand">
          <div className="sigil"></div>
          <span>sdd-hub</span>
        </div>
        <div className="crumbs">
          <span onClick={goHub} style={{ cursor: 'pointer' }} className={isHub ? 'cur' : ''}>hub</span>
          {!isHub && (
            <React.Fragment>
              <span className="sep">/</span>
              <span className="cur">{ws.name}</span>
              <span className="sep">/</span>
              <span className="cur">{route.tab}</span>
            </React.Fragment>
          )}
        </div>
        <div className="right">
          <span className="stat">
            <span className="dot live"></span>
            <b>{Object.values(window.SDD.AGENTS).filter(a => a.status === 'busy').length}</b> agents
          </span>
          <span className="stat">
            <span style={{ color: 'var(--text-3)' }}>hub</span>
            <b>localhost:7320</b>
          </span>
          <span className="stat">2026-05-14 · 10:42 UTC</span>
        </div>
      </div>

      {/* Sidebar */}
      <div className="sidebar">

        <div className={cx('ws-item', isHub && 'active')} onClick={goHub} style={{ marginBottom: 4 }}>
          <span style={{ color: isHub ? 'var(--phosphor)' : 'var(--text-2)', fontSize: 13 }}>◉</span>
          <span className="name">hub overview</span>
        </div>

        <div className="sidebar-section">
          <span>workspace</span>
          <span className="add" title="attach workspace">+</span>
        </div>

        <WorkspaceDropdown
          activeId={isHub ? null : route.wsId}
          onSelect={(wsId) => goWs(wsId, route.tab && tabs.length ? route.tab : 'session')}
        />

        {/* Workspace inner nav */}
        {!isHub && (
          <React.Fragment>
            <div className="sidebar-section" style={{ marginTop: 4 }}>navigate</div>
            {tabs.map(t => (
              <div key={t.id}
                   className={cx('nav-item', route.tab === t.id && 'active')}
                   onClick={() => navWithin(t.id, null)}>
                <span>{t.label}</span>
                {t.count != null && (
                  <span className={cx('badge', t.alert && 'alert')}>{t.count}</span>
                )}
              </div>
            ))}
          </React.Fragment>
        )}
      </div>

      {/* Main */}
      <div className="main">
        {isHub && <HubDashboard onOpenWorkspace={(wsId) => goWs(wsId)} />}
        {!isHub && route.tab === 'session'  && <SessionStart wsId={route.wsId} onNav={navWithin} />}
        {!isHub && route.tab === 'targets'  && <TargetsView initialTargetId={route.focusId} onNav={navWithin} />}
        {!isHub && route.tab === 'specs'    && <SpecsView initialSpecId={route.focusId} onNav={navWithin} />}
        {!isHub && route.tab === 'gaps'     && <GapsView initialGapId={route.focusId} onNav={navWithin} />}
        {!isHub && route.tab === 'work'     && <WorkItemsView initialWiId={route.focusId} onNav={navWithin} />}
        {!isHub && route.tab === 'activity' && <ActivityStream />}
        {!isHub && route.tab === 'settings' && <SettingsView />}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

/* ============================================================
   Workspace dropdown — replaces the inline list in the sidebar.
   Closed: shows the active workspace as a single row (or "select").
   Open:   floats a panel below with every workspace + indicators.
   ============================================================ */

function WorkspaceDropdown({ activeId, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = activeId ? window.SDD.WORKSPACES.find(w => w.id === activeId) : null;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const renderBadge = (w) => {
    if (w.counts.targetsAwaitingUser > 0)
      return <span className="ws-dd-badge" style={{ color: 'var(--st-open)' }}>{w.counts.targetsAwaitingUser}!</span>;
    if (w.counts.workBlocked > 0)
      return <span className="ws-dd-badge" style={{ color: 'var(--st-blocked)' }}>{w.counts.workBlocked}</span>;
    if (w.counts.openGaps > 0)
      return <span className="ws-dd-badge">{w.counts.openGaps}</span>;
    return null;
  };

  const isBusy = (w) => w.agents.some(id => window.SDD.AGENTS[id]?.status === 'busy');

  return (
    <div className="ws-dd" ref={ref}>
      <button className={cx('ws-dd-trigger', open && 'open')} onClick={() => setOpen(o => !o)}>
        {active ? (
          <React.Fragment>
            <span className="dot" style={{
              background: isBusy(active) ? 'var(--accent)' : 'var(--ink-4)',
            }}></span>
            <span className="ws-dd-name">{active.name}</span>
            {renderBadge(active)}
          </React.Fragment>
        ) : (
          <React.Fragment>
            <span className="dot" style={{ background: 'var(--ink-4)' }}></span>
            <span className="ws-dd-name muted">select workspace</span>
          </React.Fragment>
        )}
        <span className="ws-dd-chevron">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="ws-dd-menu" role="listbox">
          {window.SDD.WORKSPACES.map(w => {
            const isActive = activeId === w.id;
            const busy = isBusy(w);
            return (
              <div key={w.id}
                   role="option"
                   aria-selected={isActive}
                   className={cx('ws-dd-item', isActive && 'active')}
                   onClick={() => { onSelect(w.id); setOpen(false); }}>
                <span className="dot" style={{
                  background: busy ? 'var(--accent)' : 'var(--ink-4)',
                }}></span>
                <div className="ws-dd-text">
                  <div className="ws-dd-name">{w.name}</div>
                  <div className="ws-dd-path">{w.path}</div>
                </div>
                {renderBadge(w)}
              </div>
            );
          })}
          <div className="ws-dd-foot" onClick={() => setOpen(false)}>
            <span>+</span><span>attach workspace</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Workspace: Spec viewer
   Read-only browser of all SPEC items grouped by domain.
   ============================================================ */

function SpecsView({ initialSpecId, onNav }) {
  const { SPECS, GAPS, WORK_ITEMS } = window.SDD;
  const [activeSpec, setActiveSpec] = useState(initialSpecId || SPECS[0].id);
  const [activeItem, setActiveItem] = useState(null);

  const spec = SPECS.find(s => s.id === activeSpec);

  return (
    <React.Fragment>
      <Toolbar
        title="specs"
        glyph="∎"
        sub="durable source of truth — 4 domains, 14 items"
        actions={
          <React.Fragment>
            <button className="btn ghost">/sdd:spec-collapse</button>
            <button className="btn ghost">export markdown</button>
          </React.Fragment>
        }
      />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr', overflow: 'hidden' }}>
        {/* Domain list */}
        <div style={{
          background: 'var(--panel)',
          borderRight: '1px solid var(--border)',
          overflowY: 'auto',
          padding: '14px 0',
        }}>
          <div className="sidebar-section">domains</div>
          {SPECS.map(s => (
            <div key={s.id}
                 className={cx('ws-item', activeSpec === s.id && 'active')}
                 onClick={() => { setActiveSpec(s.id); setActiveItem(null); }}
                 style={{ gridTemplateColumns: '1fr auto' }}>
              <div>
                <div className="name" style={{ fontSize: 13 }}>{s.domain}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                  {s.id} · &lt;{s.version}&gt;
                </div>
              </div>
              <span className="ct">{s.items.length}</span>
            </div>
          ))}
        </div>

        {/* Spec items */}
        <div className="scroll">
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
            <div className="h-eyebrow">spec file</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{spec.id}</h2>
              <span className="id">domain: {spec.domain}</span>
              <span className="id">abbrev: {spec.abbrev}</span>
              <span className="id">version: &lt;{spec.version}&gt;</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
              {spec.items.length} active spec items · never archived
            </div>
          </div>

          <div>
            {spec.items.map(item => {
              const gaps = GAPS.filter(g => g.specItem === item.id);
              const openGaps = gaps.filter(g => g.status === 'open');
              const wis = WORK_ITEMS.filter(w => gaps.some(g => g.id === w.gapId));

              return (
                <div key={item.id} className="spec-item"
                     id={item.id}>
                  <div className="id-line">
                    <span className="id phosphor">{item.id}</span>
                    <StatusPill status="active" />
                    {openGaps.length > 0 && (
                      <span className="pill open">
                        <span className="led"></span>
                        {openGaps.length} open gap{openGaps.length === 1 ? '' : 's'}
                      </span>
                    )}
                    <span style={{ marginLeft: 'auto', color: 'var(--text-3)', fontSize: 10 }}>aliases: none</span>
                  </div>
                  <h3>{item.title}</h3>
                  <div className="body">{item.body}</div>

                  {(gaps.length > 0 || wis.length > 0) && (
                    <div className="refs">
                      {gaps.map(g => (
                        <button key={g.id} className="pill"
                                style={{ cursor: 'pointer', background: 'var(--panel-2)' }}
                                onClick={() => onNav('gaps', g.id)}>
                          <span className="led" style={{ background: g.status === 'open' ? 'var(--st-open)' : 'var(--st-done)' }}></span>
                          {g.id}
                        </button>
                      ))}
                      {wis.map(w => (
                        <button key={w.id} className="pill"
                                style={{ cursor: 'pointer', background: 'var(--panel-2)' }}
                                onClick={() => onNav('work', w.id)}>
                          <span className="led" style={{ background: 'var(--st-progress)' }}></span>
                          {w.id}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

window.SpecsView = SpecsView;

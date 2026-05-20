/* ============================================================
   Workspace: Gaps audit report
   ============================================================ */

function GapsView({ initialGapId, onNav }) {
  const { GAPS, SPECS, WORK_ITEMS, fmtAgo } = window.SDD;
  const [activeId, setActiveId] = useState(initialGapId || GAPS[0].id);
  const [filterDomain, setFilterDomain] = useState('all');

  const filtered = filterDomain === 'all'
    ? GAPS
    : GAPS.filter(g => g.domain === filterDomain);

  const active = GAPS.find(g => g.id === activeId);

  const domains = ['all', ...new Set(GAPS.map(g => g.domain))];

  return (
    <React.Fragment>
      <Toolbar
        title="gaps"
        glyph="≠"
        sub="codebase ↔ spec divergence"
        actions={
          <React.Fragment>
            <button className="btn ghost">/sdd:gap-to-work-items</button>
            <button className="btn">/sdd:spec-audit</button>
          </React.Fragment>
        }
      />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '420px 1fr', overflow: 'hidden' }}>
        {/* List */}
        <div style={{
          background: 'var(--panel)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '10px 12px',
            display: 'flex', gap: 4, alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            overflowX: 'auto',
          }}>
            {domains.map(d => (
              <button key={d}
                      onClick={() => setFilterDomain(d)}
                      className="btn ghost"
                      style={{
                        fontSize: 11,
                        padding: '3px 8px',
                        color: filterDomain === d ? 'var(--phosphor)' : 'var(--text-2)',
                        background: filterDomain === d ? 'var(--accent-tint-3)' : 'transparent',
                        whiteSpace: 'nowrap',
                      }}>
                {d}
              </button>
            ))}
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.map(g => (
              <div key={g.id}
                   className="gap-row"
                   onClick={() => setActiveId(g.id)}
                   style={{
                     background: activeId === g.id ? 'var(--panel-3)' : 'transparent',
                     borderLeft: activeId === g.id ? '2px solid var(--phosphor)' : '2px solid transparent',
                     paddingLeft: activeId === g.id ? 16 : 18,
                   }}>
                <div className="top">
                  <span className="id phosphor">{g.id}</span>
                  <StatusPill status={g.status} />
                  {g.closedBy && <span className="pill progress"><span className="led"></span>{g.closedBy}</span>}
                </div>
                <div className="ttl">{g.title}</div>
                <div className="loc">
                  <span className="path">{g.location.split(':')[0]}</span>
                  <span className="lnum">:{g.location.split(':')[1]}</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>
                  ↑ {g.specItem} · audited &lt;{g.auditVersion}&gt; · {fmtAgo(g.discovered)} ago
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        {active ? <GapDetail gap={active} onNav={onNav} /> : <Empty>select a gap</Empty>}
      </div>
    </React.Fragment>
  );
}

function GapDetail({ gap, onNav }) {
  const { SPECS, WORK_ITEMS, fmtAgo } = window.SDD;
  const specItem = SPECS.flatMap(s => s.items).find(i => i.id === gap.specItem);
  const closer = WORK_ITEMS.find(w => w.id === gap.closedBy);

  return (
    <div className="scroll" style={{ padding: '0 0 60px' }}>
      <div style={{
        padding: '18px 24px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span className="id phosphor" style={{ fontSize: 13 }}>{gap.id}</span>
          <StatusPill status={gap.status} />
          {gap.closedBy ? (
            <span className="pill progress" onClick={() => onNav('work', gap.closedBy)} style={{ cursor: 'pointer' }}>
              <span className="led"></span>
              addressed by {gap.closedBy}
            </span>
          ) : (
            <button className="btn primary" style={{ marginLeft: 'auto' }}>
              + create work item
            </button>
          )}
        </div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 500, color: 'var(--text-0)', lineHeight: 1.3 }}>
          {gap.title}
        </h2>
      </div>

      <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        <div style={{ minWidth: 0 }}>
          <div className="h-eyebrow">location</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--panel-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-2)',
            padding: '8px 12px',
            fontSize: 12,
            marginBottom: 16,
          }}>
            <span style={{ color: 'var(--text-3)' }}>📄</span>
            <span className="path">{gap.location.split(':')[0]}</span>
            <span className="lnum">:{gap.location.split(':')[1]}</span>
            <span style={{ marginLeft: 'auto', color: 'var(--text-3)', fontSize: 10 }}>
              jump to source ↗
            </span>
          </div>

          <div className="h-eyebrow">reasoning</div>
          <div style={{
            fontSize: 12.5,
            color: 'var(--text-1)',
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-3)',
            padding: '12px 14px',
            lineHeight: 1.6,
            marginBottom: 18,
          }}
               dangerouslySetInnerHTML={{ __html: gap.reasoning.replace(/`([^`]+)`/g, '<span class="code">$1</span>') }}>
          </div>

          <div className="h-eyebrow">code context</div>
          <CodeView context={gap.codeContext} />
        </div>

        <div>
          <div className="h-eyebrow">spec item</div>
          <div className="card card-pad" style={{ marginBottom: 14, cursor: 'pointer' }}
               onClick={() => onNav('specs', SPECS.find(s => s.items.includes(specItem)).id, gap.specItem)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="id phosphor" style={{ fontSize: 11 }}>{specItem.id}</span>
              <StatusPill status="active" />
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--text-0)', marginBottom: 4 }}>
              {specItem.title}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
              {specItem.body.slice(0, 140)}…
            </div>
          </div>

          <div className="h-eyebrow">audit metadata</div>
          <div style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-3)',
            padding: '10px 12px',
            fontSize: 11,
            color: 'var(--text-2)',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div><span style={{ color: 'var(--text-3)' }}>discovered</span> {gap.discovered.split('T')[0]} ({fmtAgo(gap.discovered)} ago)</div>
            <div><span style={{ color: 'var(--text-3)' }}>spec version</span> &lt;{gap.auditVersion}&gt;</div>
            <div><span style={{ color: 'var(--text-3)' }}>status</span> {gap.status}</div>
          </div>

          {closer && (
            <div style={{ marginTop: 16 }}>
              <div className="h-eyebrow">work item</div>
              <div className="card card-pad" style={{ cursor: 'pointer' }}
                   onClick={() => onNav('work', closer.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span className="id phosphor" style={{ fontSize: 11 }}>{closer.id}</span>
                  <StatusPill status={closer.status} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-0)', marginBottom: 4 }}>
                  {closer.title}
                </div>
                {closer.agent && (
                  <div style={{ marginTop: 6 }}>
                    <AgentChip agentId={closer.agent} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.GapsView = GapsView;

/* ============================================================
   Workspace: Work Item Kanban + Detail Drawer
   ============================================================ */

function WorkItemsView({ initialWiId, onNav }) {
  const { WORK_ITEMS, fmtAgo } = window.SDD;
  const [drawerId, setDrawerId] = useState(initialWiId || null);

  const cols = [
    { id: 'pending',     label: 'pending',     items: WORK_ITEMS.filter(w => w.status === 'pending') },
    { id: 'in-progress', label: 'in progress', items: WORK_ITEMS.filter(w => w.status === 'in-progress') },
    { id: 'blocked',     label: 'blocked',     items: WORK_ITEMS.filter(w => w.status === 'blocked') },
    { id: 'done',        label: 'done · today', items: WORK_ITEMS.filter(w => w.status === 'done') },
  ];

  const active = WORK_ITEMS.find(w => w.id === drawerId);

  return (
    <React.Fragment>
      <Toolbar
        title="work items"
        glyph="□"
        sub="scoped tasks closing gaps"
        actions={
          <React.Fragment>
            <button className="btn ghost">filter by domain</button>
            <button className="btn ghost">/sdd:work-item-close</button>
          </React.Fragment>
        }
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div className="kanban" style={{ flex: 1, overflowY: 'auto' }}>
          {cols.map(col => (
            <div key={col.id} className="col-kb">
              <div className="head">
                <span className="dot" style={{ background: statusColor(col.id) }}></span>
                {col.label}
                <span className="ct">{col.items.length}</span>
              </div>
              <div className="body">
                {col.items.length === 0 ? (
                  <div style={{
                    fontSize: 11, color: 'var(--text-3)',
                    padding: '12px 8px', textAlign: 'center',
                    border: '1px dashed var(--border)',
                    borderRadius: 'var(--r-2)',
                  }}>
                    empty
                  </div>
                ) : (
                  col.items.map(w => (
                    <div key={w.id} className={`kcard ${w.status === 'in-progress' ? 'progress' : w.status}`}
                         onClick={() => setDrawerId(w.id)}>
                      <div className="id">{w.id}</div>
                      <div className="ttl">{w.title}</div>
                      <div className="foot">
                        {w.agent ? <AgentChip agentId={w.agent} /> :
                          <span style={{ color: 'var(--text-3)' }}>unassigned</span>}
                        <span style={{ marginLeft: 'auto', color: 'var(--text-3)' }}>
                          ↑ {w.gapId}
                        </span>
                      </div>
                      {w.status === 'in-progress' && w.progressNote && (
                        <div style={{
                          marginTop: 8, paddingTop: 8,
                          borderTop: '1px solid var(--border)',
                          fontSize: 10.5, color: 'var(--text-2)',
                          lineHeight: 1.4, fontStyle: 'italic',
                        }}>
                          ▸ {w.progressNote}
                        </div>
                      )}
                      {w.status === 'blocked' && (
                        <div style={{
                          marginTop: 8, paddingTop: 8,
                          borderTop: '1px solid var(--border)',
                          fontSize: 10.5, color: 'var(--st-blocked)',
                          display: 'flex', gap: 6, alignItems: 'flex-start',
                        }}>
                          <span>⏸</span><span>{w.blockedReason}</span>
                        </div>
                      )}
                      {w.status === 'done' && w.closed && (
                        <div style={{
                          marginTop: 6,
                          fontSize: 10, color: 'var(--text-3)',
                        }}>
                          closed {fmtAgo(w.closed)} ago
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {active && (
          <WorkItemDrawer wi={active} onClose={() => setDrawerId(null)} onNav={onNav} />
        )}
      </div>
    </React.Fragment>
  );
}

function statusColor(status) {
  return ({
    pending:       'var(--border-bright)',
    'in-progress': 'var(--st-progress)',
    blocked:       'var(--st-blocked)',
    done:          'var(--st-done)',
  })[status] || 'var(--text-3)';
}

function WorkItemDrawer({ wi, onClose, onNav }) {
  const { GAPS, SPECS, fmtAgo } = window.SDD;
  const gap = GAPS.find(g => g.id === wi.gapId);
  const specItem = gap ? SPECS.flatMap(s => s.items).find(i => i.id === gap.specItem) : null;

  return (
    <div style={{
      width: 460,
      borderLeft: '1px solid var(--border)',
      background: 'var(--panel)',
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      <div style={{
        padding: '16px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span className="id phosphor">{wi.id}</span>
        <StatusPill status={wi.status} />
        <button className="btn ghost" style={{ marginLeft: 'auto' }} onClick={onClose}>✕</button>
      </div>

      <div style={{ padding: 18 }}>
        <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 500, color: 'var(--text-0)', lineHeight: 1.4 }}>
          {wi.title}
        </h2>

        {wi.status === 'blocked' && wi.blockedReason && (
          <div style={{
            background: 'var(--danger-tint-1)',
            border: '1px solid var(--danger-tint-3)',
            borderRadius: 'var(--r-3)',
            padding: '10px 12px',
            marginBottom: 14,
            color: 'var(--st-blocked)',
            fontSize: 12,
            lineHeight: 1.5,
          }}>
            <b>blocked:</b> {wi.blockedReason}
          </div>
        )}

        {wi.agent && (
          <div style={{ marginBottom: 16 }}>
            <div className="h-eyebrow">working agent</div>
            <AgentChip agentId={wi.agent} />
          </div>
        )}

        <div className="h-eyebrow">scope</div>
        <div style={{ fontSize: 12, color: 'var(--text-0)', marginBottom: 16, lineHeight: 1.6 }}
             dangerouslySetInnerHTML={{ __html: wi.scope.replace(/`([^`]+)`/g, '<span class="code">$1</span>').replace(/([a-z_/.]+\.[a-z]+)/, '<span class="path">$1</span>') }}>
        </div>

        <div className="h-eyebrow">acceptance criteria</div>
        <ul style={{ margin: '0 0 16px', paddingLeft: 0, listStyle: 'none' }}>
          {wi.acceptance.map((a, i) => (
            <li key={i} style={{
              fontSize: 12, color: 'var(--text-1)',
              padding: '6px 0', display: 'flex', gap: 8, lineHeight: 1.5,
              borderBottom: i < wi.acceptance.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ color: wi.status === 'done' ? 'var(--phosphor)' : 'var(--text-3)' }}>
                {wi.status === 'done' ? '✓' : '○'}
              </span>
              <span>{a}</span>
            </li>
          ))}
        </ul>

        {wi.progressNote && wi.status === 'in-progress' && (
          <div style={{ marginBottom: 16 }}>
            <div className="h-eyebrow">latest from agent</div>
            <div style={{
              background: 'var(--panel-2)',
              border: '1px solid var(--border)',
              borderLeft: '2px solid var(--st-progress)',
              borderRadius: 'var(--r-2)',
              padding: '8px 12px',
              fontSize: 12,
              color: 'var(--text-0)',
              fontStyle: 'italic',
            }}>
              ▸ {wi.progressNote}
            </div>
          </div>
        )}

        {gap && (
          <div style={{ marginBottom: 16 }}>
            <div className="h-eyebrow">closing gap</div>
            <div className="card card-pad" style={{ cursor: 'pointer' }}
                 onClick={() => onNav('gaps', gap.id)}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span className="id phosphor" style={{ fontSize: 11 }}>{gap.id}</span>
                <StatusPill status={gap.status} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-0)', marginBottom: 4 }}>{gap.title}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
                <span className="path">{gap.location.split(':')[0]}</span><span className="lnum">:{gap.location.split(':')[1]}</span>
              </div>
            </div>
          </div>
        )}

        {specItem && (
          <div style={{ marginBottom: 16 }}>
            <div className="h-eyebrow">tracing to spec</div>
            <div style={{
              padding: '8px 12px', borderLeft: '2px solid var(--phosphor)',
              background: 'var(--accent-tint-1)',
              cursor: 'pointer',
            }} onClick={() => onNav('specs', SPECS.find(s => s.items.includes(specItem)).id)}>
              <div className="id phosphor" style={{ fontSize: 11, marginBottom: 3 }}>{specItem.id}</div>
              <div style={{ fontSize: 12, color: 'var(--text-0)', lineHeight: 1.4 }}>{specItem.title}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          {wi.status === 'pending' && (
            <button className="btn primary">▸ assign agent + start</button>
          )}
          {wi.status === 'in-progress' && (
            <button className="btn primary">/sdd:work-item-close {wi.id}</button>
          )}
          {wi.status === 'blocked' && (
            <button className="btn">unblock</button>
          )}
          <button className="btn ghost">abandon</button>
        </div>
      </div>
    </div>
  );
}

window.WorkItemsView = WorkItemsView;

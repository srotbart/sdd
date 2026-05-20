/* ============================================================
   Workspace: Session Start / Overview
   Mirrors the /sdd:session-start output, but graphical
   ============================================================ */

function SessionStart({ wsId, onNav }) {
  const { TARGETS, SPECS, GAPS, WORK_ITEMS, fmtAgo } = window.SDD;

  // The data we have is for "plover". Other workspaces show simplified placeholders.
  const isPrimary = wsId === 'plover';

  if (!isPrimary) {
    return <SessionStartLite wsId={wsId} />;
  }

  const targetsByStatus = (s) => TARGETS.filter(t => t.status === s);
  const awaitingUser  = targetsByStatus('awaiting-user');
  const awaitingAgent = targetsByStatus('awaiting-agent');
  const ready         = targetsByStatus('ready');
  const draft         = targetsByStatus('draft');

  const openGaps    = GAPS.filter(g => g.status === 'open');
  const inProgress  = WORK_ITEMS.filter(w => w.status === 'in-progress');
  const blocked     = WORK_ITEMS.filter(w => w.status === 'blocked');
  const pending     = WORK_ITEMS.filter(w => w.status === 'pending');

  // stale: billing audit version c4e1f205 — pretend its spec content changed
  const staleDomains = ['billing'];

  const next = nextActionFor({ awaitingUser, ready, staleDomains, openGaps, work: [...inProgress, ...blocked, ...pending] });

  return (
    <React.Fragment>
      <Toolbar
        title="plover"
        glyph="●"
        sub="~/code/plover"
        actions={
          <React.Fragment>
            <button className="btn ghost">refresh</button>
            <button className="btn">terminal</button>
            <button className="btn primary">+ new target</button>
          </React.Fragment>
        }
      />

      <div className="scroll">
        <div className="p-18" style={{ maxWidth: 1180 }}>

          {/* Terminal-style header */}
          <div className="terminal" style={{ marginBottom: 22 }}>
            <div>
              <span className="prompt">$</span>
              <span style={{ color: 'var(--text-0)' }}>/sdd:session-start</span>
              <span className="caret"></span>
            </div>
            <div style={{ color: 'var(--text-2)', marginTop: 4, fontSize: 11 }}>
              ran 2 minutes ago by cc-main · spec version &lt;a3f9c812&gt;
            </div>
          </div>

          {/* Pipeline */}
          <Pipeline activeIdx={2} stages={[
            { key: 'targets', label: 'targets',    n: TARGETS.length },
            { key: 'specs',   label: 'spec items', n: SPECS.reduce((a, s) => a + s.items.length, 0) },
            { key: 'gaps',    label: 'open gaps',  n: openGaps.length },
            { key: 'work',    label: 'work items', n: pending.length + inProgress.length + blocked.length },
            { key: 'done',    label: 'done today', n: 3 },
          ]} />

          {/* Awaiting your input — primary call-to-action */}
          {awaitingUser.length > 0 && (
            <div className="session-cat">
              <div className="head">
                <span className="ttl alert">▸ targets awaiting your input</span>
                <span className="ct">{awaitingUser.length}</span>
                <span className="rule"></span>
              </div>
              <div className="card">
                {awaitingUser.map(t => (
                  <div key={t.id} className="row-table" onClick={() => onNav('targets', t.id)}>
                    <div className="row">
                      <span className="id phosphor">{t.id}</span>
                      <div>
                        <div className="ttl">{t.title}</div>
                        <div className="meta">
                          <span>[{t.domain}]</span>
                          <span>· {fmtAgo(t.created)} ago</span>
                          <span>· {t.dialog.length} dialog turn{t.dialog.length === 1 ? '' : 's'}</span>
                        </div>
                      </div>
                      <StatusPill status={t.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Awaiting agent */}
          {awaitingAgent.length > 0 && (
            <CategoryRows title="targets awaiting agent" count={awaitingAgent.length}>
              {awaitingAgent.map(t => (
                <CompactRow key={t.id} id={t.id} title={t.title} meta={`[${t.domain}]`}
                            status={t.status} onClick={() => onNav('targets', t.id)} />
              ))}
            </CategoryRows>
          )}

          {/* Ready */}
          {ready.length > 0 && (
            <CategoryRows title="ready targets — pending spec reconciliation" count={ready.length}>
              {ready.map(t => (
                <CompactRow key={t.id} id={t.id} title={t.title} meta={`[${t.domain}]`}
                            status={t.status} onClick={() => onNav('targets', t.id)} />
              ))}
            </CategoryRows>
          )}

          {/* Drafts */}
          {draft.length > 0 && (
            <CategoryRows title="draft targets — not submitted" count={draft.length}>
              {draft.map(t => (
                <CompactRow key={t.id} id={t.id} title={t.title || '(empty)'} meta={`[${t.domain}]`}
                            status={t.status} onClick={() => onNav('targets', t.id)} />
              ))}
            </CategoryRows>
          )}

          {/* Specs summary */}
          <div className="session-cat">
            <div className="head">
              <span className="ttl">specs</span>
              <span className="ct">{SPECS.length} domains</span>
              <span className="rule"></span>
            </div>
            <div className="card">
              <div className="row-table">
                {SPECS.map(s => {
                  const isStale = staleDomains.includes(s.domain);
                  return (
                    <div key={s.id} className="row" onClick={() => onNav('specs', s.id)}>
                      <span className="id">{s.id}</span>
                      <div>
                        <div className="ttl">{s.domain}</div>
                        <div className="meta">
                          <span>{s.items.length} items</span>
                          <span className="id">&lt;{s.version}&gt;</span>
                          {isStale && <span className="pill stale"><span className="led"></span>stale audit</span>}
                        </div>
                      </div>
                      <button className="btn ghost" onClick={(e) => { e.stopPropagation(); onNav('specs', s.id); }}>
                        view →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Stale audit warning */}
          {staleDomains.length > 0 && (
            <div className="card" style={{
              padding: '14px 18px',
              marginBottom: 22,
              borderColor: 'var(--stale-tint-2)',
              background: 'var(--stale-tint-1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--st-stale)', fontSize: 12 }}>
                <span style={{ fontSize: 16 }}>⚠</span>
                <b>stale audits</b>
                <span style={{ color: 'var(--text-2)' }}>·</span>
                <span style={{ color: 'var(--text-1)' }}>
                  {staleDomains.join(', ')} — gaps at &lt;c4e1f205&gt;, spec now &lt;f2a8b134&gt;
                </span>
                <button className="btn ghost" style={{ marginLeft: 'auto' }}>
                  re-run /sdd:spec-audit
                </button>
              </div>
            </div>
          )}

          {/* Open gaps */}
          {openGaps.length > 0 && (
            <CategoryRows title="open gaps" count={openGaps.length}>
              {openGaps.slice(0, 5).map(g => (
                <CompactRow key={g.id} id={g.id} title={g.title}
                            meta={<><span className="id">[{g.specItem}]</span></>}
                            status={g.status} onClick={() => onNav('gaps', g.id)} />
              ))}
              {openGaps.length > 5 && (
                <div className="row" style={{ padding: '8px 16px', color: 'var(--text-3)', fontSize: 11 }}>
                  … and {openGaps.length - 5} more
                </div>
              )}
            </CategoryRows>
          )}

          {/* Work items */}
          <CategoryRows title="active work items"
                        count={inProgress.length + blocked.length + pending.length}>
            {[...inProgress, ...blocked, ...pending].slice(0, 5).map(w => (
              <CompactRow key={w.id} id={w.id} title={w.title}
                          meta={<>{w.agent && <AgentChip agentId={w.agent} />}</>}
                          status={w.status} onClick={() => onNav('work', w.id)} />
            ))}
          </CategoryRows>

          {/* Footer next action */}
          <div className="terminal" style={{ marginTop: 18 }}>
            <div className="next">
              <span style={{ color: 'var(--text-2)' }}>next:</span>{' '}
              <span style={{ color: 'var(--text-0)' }}>{next.text}</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <span className="prompt">$</span>
              <span style={{ color: 'var(--text-0)' }}>{next.cmd}</span>
              <span className="caret"></span>
            </div>
          </div>

        </div>
      </div>
    </React.Fragment>
  );
}

function nextActionFor({ awaitingUser, ready, staleDomains, openGaps, work }) {
  if (awaitingUser.length > 0) {
    return {
      text: `${awaitingUser.length} target${awaitingUser.length === 1 ? '' : 's'} need your input.`,
      cmd: `/sdd:target-engage ${awaitingUser[0].id}`,
    };
  }
  if (ready.length > 0) {
    return { text: 'ready target waiting for spec reconciliation.', cmd: `/sdd:target-engage ${ready[0].id}` };
  }
  if (staleDomains.length > 0) {
    return { text: 'stale audit — refresh before opening new work.', cmd: `/sdd:spec-audit ${staleDomains[0]}` };
  }
  if (openGaps.length > 0) {
    return { text: 'open gaps — decompose into work items.', cmd: `/sdd:gap-to-work-items ${openGaps[0].abbrev}` };
  }
  if (work.length > 0) {
    return { text: 'pending work — close the next item.', cmd: `/sdd:work-item-close ${work[0].id}` };
  }
  return { text: 'all clear.', cmd: '/sdd:session-start' };
}

function CategoryRows({ title, count, children }) {
  return (
    <div className="session-cat">
      <div className="head">
        <span className="ttl">{title}</span>
        <span className="ct">{count}</span>
        <span className="rule"></span>
      </div>
      <div className="card">
        <div className="row-table">{children}</div>
      </div>
    </div>
  );
}

function CompactRow({ id, title, meta, status, onClick }) {
  return (
    <div className="row" onClick={onClick}>
      <span className="id phosphor">{id}</span>
      <div>
        <div className="ttl">{title}</div>
        <div className="meta">{meta}</div>
      </div>
      <StatusPill status={status} />
    </div>
  );
}

function SessionStartLite({ wsId }) {
  const ws = window.SDD.WORKSPACES.find(w => w.id === wsId);
  return (
    <React.Fragment>
      <Toolbar title={ws.name} glyph="●" sub={ws.path} />
      <div className="scroll p-18">
        <div className="terminal" style={{ marginBottom: 18 }}>
          <div><span className="prompt">$</span><span style={{ color: 'var(--text-0)' }}>/sdd:session-start</span></div>
        </div>

        {(ws.counts.targetsAwaitingUser + ws.counts.openGaps + ws.counts.workPending + ws.counts.workInProgress + ws.counts.workBlocked === 0) ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 40, color: 'var(--phosphor)', marginBottom: 8 }}>◌</div>
            <div style={{ fontSize: 16, color: 'var(--text-0)', marginBottom: 6 }}>all clear</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
              no open targets, gaps, or work items.
            </div>
            <div style={{ marginTop: 18 }}>
              <button className="btn primary">+ new target</button>
            </div>
          </div>
        ) : (
          <div className="empty">
            {ws.counts.targetsAwaitingUser > 0 && <div>{ws.counts.targetsAwaitingUser} target awaiting input</div>}
            {ws.counts.openGaps > 0 && <div>{ws.counts.openGaps} open gaps</div>}
            {ws.counts.workPending > 0 && <div>{ws.counts.workPending} pending work items</div>}
            {ws.counts.targetsDraft > 0 && <div>{ws.counts.targetsDraft} draft targets</div>}
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

window.SessionStart = SessionStart;

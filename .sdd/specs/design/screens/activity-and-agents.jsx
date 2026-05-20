/* ============================================================
   Workspace: Activity stream + Agents + Settings
   ============================================================ */

function ActivityStream() {
  const { ACTIVITY, AGENTS } = window.SDD;
  const [filterAgent, setFilterAgent] = useState('all');
  const [paused, setPaused] = useState(false);
  const [tickCount, setTickCount] = useState(0);

  // Subtle live tick: append a fake heartbeat line every ~6s
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setTickCount(c => c + 1), 6500);
    return () => clearInterval(t);
  }, [paused]);

  const liveExtras = useMemo(() => {
    const opts = [
      { agent: 'cc-main',    kind: 'in',   msg: 'wrote <span class="ref">tests/auth/test_admin.py:24</span> — adding MFA assertion' },
      { agent: 'cc-main',    kind: 'in',   msg: 'running <b>pytest -k mfa_present</b>' },
      { agent: 'cc-audit',   kind: 'in',   msg: 'edited <span class="ref">src/jobs/transcribe.py:204</span>' },
      { agent: 'cc-billing', kind: 'note', msg: 'still blocked on TGT-014' },
      { agent: 'cc-main',    kind: 'in',   msg: '<b>1 test passed</b>, 0 failed' },
    ];
    return Array.from({ length: tickCount }).map((_, i) => {
      const o = opts[i % opts.length];
      const t = new Date(window.SDD.NOW.getTime() + (i + 1) * 6500);
      return { ...o, t: t.toISOString().slice(11, 19) };
    }).reverse();
  }, [tickCount]);

  const lines = [...liveExtras, ...ACTIVITY];
  const filtered = filterAgent === 'all' ? lines : lines.filter(l => l.agent === filterAgent);

  const uniqueAgents = ['all', ...new Set(ACTIVITY.map(l => l.agent))];

  return (
    <React.Fragment>
      <Toolbar
        title="activity"
        glyph="≡"
        sub="agents working on this workspace"
        actions={
          <React.Fragment>
            <Toggle on={!paused} onChange={(v) => setPaused(!v)} label={paused ? 'paused' : 'live'} />
            <button className="btn ghost">export log</button>
          </React.Fragment>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Agent filter row */}
        <div style={{
          padding: '10px 18px',
          display: 'flex', gap: 8, alignItems: 'center',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginRight: 4 }}>
            agent
          </span>
          {uniqueAgents.map(a => (
            <button key={a}
                    onClick={() => setFilterAgent(a)}
                    className="btn ghost"
                    style={{
                      fontSize: 11,
                      padding: '3px 8px',
                      color: filterAgent === a ? 'var(--phosphor)' : 'var(--text-2)',
                      background: filterAgent === a ? 'var(--accent-tint-3)' : 'transparent',
                    }}>
              {a}
            </button>
          ))}
          {!paused && (
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-2)' }}>
              <span className="dot live"></span> live · {Object.values(AGENTS).filter(a => a.status === 'busy').length} busy
            </span>
          )}
        </div>

        <div className="stream">
          {filtered.map((line, i) => (
            <div key={i} className={`line ${line.kind || 'in'}`}>
              <span className="t">{line.t}</span>
              <span className="a">{line.agent}</span>
              <span className="m" dangerouslySetInnerHTML={{ __html: line.msg }}></span>
            </div>
          ))}
          {!paused && (
            <div className="line" style={{ opacity: 0.5 }}>
              <span className="t">···</span>
              <span className="a">listening</span>
              <span className="m"><span className="caret"></span></span>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

/* ============================================================
   Agents tab — connected Claude Code instances
   ============================================================ */

function AgentsView() {
  const { AGENTS, WORK_ITEMS } = window.SDD;
  // For "plover" workspace, show the 4 agents associated with it
  const agentIds = ['agent-01', 'agent-02', 'agent-04'];
  const agents = agentIds.map(id => AGENTS[id]);
  const wiByAgent = WORK_ITEMS.reduce((acc, w) => {
    if (w.agent) (acc[w.agent] = acc[w.agent] || []).push(w);
    return acc;
  }, {});

  return (
    <React.Fragment>
      <Toolbar
        title="agents"
        glyph="◎"
        sub={`${agents.filter(a => a.status === 'busy').length} of ${agents.length} active`}
        actions={
          <button className="btn primary">
            <span>+</span> attach claude code
          </button>
        }
      />

      <div className="scroll p-18">

        {/* Attach card */}
        <div className="card" style={{ padding: 18, marginBottom: 22, borderStyle: 'dashed', borderColor: 'var(--border-2)' }}>
          <div className="h-eyebrow">attach a new agent</div>
          <div style={{ fontSize: 12, color: 'var(--text-1)', marginBottom: 14, maxWidth: 600 }}>
            run this command in a terminal at <span className="code">~/code/plover</span>. the agent will register with the hub and inherit this workspace&apos;s skills.
          </div>
          <div style={{
            background: '#06090890',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-2)',
            padding: '10px 14px',
            fontFamily: 'var(--mono)',
            fontSize: 12.5,
            color: 'var(--text-0)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ color: 'var(--phosphor)' }}>$</span>
            <span>claude --hub <span className="text-phos">localhost:7320</span> --workspace <span className="text-phos">plover</span></span>
            <span style={{ marginLeft: 'auto', cursor: 'pointer', color: 'var(--text-3)' }}>copy</span>
          </div>
        </div>

        <HSection count={agents.length}>connected agents</HSection>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
          {agents.map(a => {
            const myWork = wiByAgent[a.id] || [];
            return (
              <div key={a.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <AgentDot agentId={a.id} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--text-0)', fontWeight: 500 }}>{a.name}</span>
                      {a.status === 'busy' && <span className="pill phosphor"><span className="led"></span>active</span>}
                      {a.status === 'idle' && <span className="pill draft"><span className="led"></span>idle</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                      {a.host} · pid <span className="id">{a.pid}</span>
                    </div>
                  </div>
                  <button className="btn ghost" style={{ fontSize: 11 }}>detach</button>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, fontSize: 11.5, color: 'var(--text-2)' }}>
                  {myWork.filter(w => w.status === 'in-progress').length > 0 ? (
                    <>
                      <div style={{ color: 'var(--text-3)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                        currently working on
                      </div>
                      {myWork.filter(w => w.status === 'in-progress').map(w => (
                        <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <span className="id phosphor" style={{ fontSize: 10 }}>{w.id}</span>
                          <span style={{ color: 'var(--text-0)' }}>{w.title}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-3)' }}>no work assigned</span>
                  )}
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  paddingTop: 12, marginTop: 12,
                  borderTop: '1px solid var(--border)',
                  fontSize: 11, color: 'var(--text-2)',
                }}>
                  <span>skills: <span style={{ color: 'var(--text-0)' }}>session-start · target-engage · spec-audit · gap-to-work-items · work-item-close · spec-collapse</span></span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </React.Fragment>
  );
}

/* ============================================================
   Settings tab
   ============================================================ */

function SettingsView() {
  const [autoArchive, setAutoArchive] = useState(true);
  const [staleCheck, setStaleCheck] = useState(true);
  const [autoAudit, setAutoAudit] = useState(false);
  const [conflictMode, setConflictMode] = useState('surface');

  return (
    <React.Fragment>
      <Toolbar title="workspace settings" glyph="⚙" />

      <div className="scroll p-18" style={{ maxWidth: 820 }}>

        <HSection>workspace</HSection>
        <div className="card card-pad" style={{ marginBottom: 22 }}>
          <div className="kv">
            <div className="k">name</div>
            <div className="v"><input defaultValue="plover" /></div>
            <div className="k">path</div>
            <div className="v"><input defaultValue="~/code/plover" /></div>
            <div className="k">description</div>
            <div className="v"><input defaultValue="meeting transcription + shareable notes" /></div>
            <div className="k">.sdd location</div>
            <div className="v muted">~/code/plover/.sdd</div>
          </div>
        </div>

        <HSection>sdd behavior</HSection>
        <div className="card card-pad" style={{ marginBottom: 22 }}>
          <SettingRow
            title="auto-archive terminal artifacts"
            desc="move targets/gaps/work-items to archive/ as they hit terminal status (accepted, closed, done)"
            control={<Toggle on={autoArchive} onChange={setAutoArchive} />}
          />
          <SettingRow
            title="warn on stale audits"
            desc="compare gap audit-spec-version to current spec hash on session-start; flag mismatches"
            control={<Toggle on={staleCheck} onChange={setStaleCheck} />}
          />
          <SettingRow
            title="auto-run spec-audit on spec write"
            desc="re-audit the domain when the spec file changes. off by default — runs can be slow"
            control={<Toggle on={autoAudit} onChange={setAutoAudit} />}
          />
          <SettingRow
            title="target / spec conflict handling"
            desc="when target-engage detects a ready target that contradicts the spec"
            control={
              <div style={{ display: 'flex', gap: 6 }}>
                {['surface', 'auto-merge'].map(m => (
                  <button key={m}
                          className={`btn ${conflictMode === m ? 'primary' : ''}`}
                          style={{ fontSize: 11 }}
                          onClick={() => setConflictMode(m)}>
                    {m}
                  </button>
                ))}
              </div>
            }
            last
          />
        </div>

      </div>
    </React.Fragment>
  );
}

function SettingRow({ title, desc, control, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 18,
      padding: '14px 0',
      borderBottom: last ? 'none' : '1px solid var(--border)',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, color: 'var(--text-0)', marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.5, maxWidth: 540 }}>{desc}</div>
      </div>
      <div style={{ flexShrink: 0, paddingTop: 2 }}>{control}</div>
    </div>
  );
}

Object.assign(window, { ActivityStream, AgentsView, SettingsView });

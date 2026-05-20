import './Dashboard.css';
import type { Agent, WorkspaceData, ActivityLine } from '../types';
import { AgentChip } from '../components/AgentChip';

interface DashboardTotals {
  awaitingUser: number;
  targets: number;
  openGaps: number;
  work: number;
  stale: number;
}

function computeTotals(workspaces: WorkspaceData[]): DashboardTotals {
  return workspaces.reduce<DashboardTotals>(
    (t, w) => {
      t.targets +=
        w.counts.targetsAwaitingUser +
        w.counts.targetsAwaitingAgent +
        w.counts.targetsReady +
        w.counts.targetsDraft;
      t.awaitingUser += w.counts.targetsAwaitingUser;
      t.openGaps += w.counts.openGaps;
      t.work += w.counts.workPending + w.counts.workInProgress + w.counts.workBlocked;
      t.stale += w.counts.staleAuditDomains;
      return t;
    },
    { targets: 0, awaitingUser: 0, openGaps: 0, work: 0, stale: 0 },
  );
}

interface SummaryStatProps {
  label: string;
  value: number;
  accent?: 'warn' | 'bad' | null;
  hint?: string;
}

function SummaryStat({ label, value, accent, hint }: SummaryStatProps) {
  const valueClass =
    accent === 'warn' && value > 0
      ? 'summary-stat__value--warn'
      : accent === 'bad' && value > 0
        ? 'summary-stat__value--bad'
        : value > 0
          ? 'summary-stat__value--default'
          : 'summary-stat__value--zero';

  return (
    <div className="summary-stat">
      <div className="summary-stat__label">{label}</div>
      <div className={`summary-stat__value ${valueClass}`}>{value}</div>
      {hint && <div className="summary-stat__hint">{hint}</div>}
    </div>
  );
}

interface HSectionProps {
  children: React.ReactNode;
  count?: number;
}

function HSection({ children, count }: HSectionProps) {
  return (
    <div className="h-section">
      <span>{children}</span>
      {count != null && <span className="h-section__count">{count}</span>}
      <span className="h-section__rule" />
    </div>
  );
}

interface WorkspaceTileProps {
  ws: WorkspaceData;
  agents: Record<string, Agent>;
  now: Date;
  onOpen: () => void;
}

function fmtAgo(date: string, now: Date): string {
  const d = new Date(date);
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
}

function WorkspaceTile({ ws, agents, now, onOpen }: WorkspaceTileProps) {
  const isBusy = ws.agents.some((id) => agents[id]?.status === 'busy');
  const activityFresh =
    now.getTime() - new Date(ws.lastActivity).getTime() < 5 * 60 * 1000;
  const blocked = ws.counts.workBlocked;
  const stale = ws.counts.staleAuditDomains;

  return (
    <div
      className={`workspace-tile${isBusy ? ' workspace-tile--active' : ''}`}
      onClick={onOpen}
    >
      <div className="workspace-tile__head">
        <span
          className={`workspace-tile__dot${isBusy ? ' workspace-tile__dot--live' : ' workspace-tile__dot--idle'}`}
        />
        <span className="workspace-tile__name">{ws.name}</span>
        {ws.pinned && <span className="workspace-tile__pin">★</span>}
        {stale > 0 && (
          <span className="workspace-tile__stale-badge">
            <span className="workspace-tile__stale-led" />
            stale
          </span>
        )}
      </div>

      <div className="workspace-tile__path">{ws.path}</div>

      <div className="workspace-tile__agents">
        {ws.agents.length === 0 ? (
          <span className="workspace-tile__no-agents">no agents attached</span>
        ) : (
          ws.agents.map((id) =>
            agents[id] ? <AgentChip key={id} agent={agents[id]} /> : null,
          )
        )}
      </div>

      <div className="workspace-tile__activity">
        <span
          className={`workspace-tile__activity-dot${activityFresh ? ' workspace-tile__activity-dot--live' : ''}`}
        />
        <span>
          {isBusy
            ? 'active now'
            : `last activity ${fmtAgo(ws.lastActivity, now)} ago`}
        </span>
      </div>

      <div className="workspace-tile__stats">
        <div
          className={`workspace-tile__stat${ws.counts.targetsAwaitingUser > 0 ? ' workspace-tile__stat--warn' : ''}`}
        >
          <b>{ws.counts.targetsAwaitingUser}</b>
          await user
        </div>
        <div
          className={`workspace-tile__stat${ws.counts.openGaps > 0 ? ' workspace-tile__stat--has' : ''}`}
        >
          <b>{ws.counts.openGaps}</b>
          gaps
        </div>
        <div
          className={`workspace-tile__stat${ws.counts.workInProgress > 0 ? ' workspace-tile__stat--has' : ''}`}
        >
          <b>{ws.counts.workInProgress}</b>
          in&nbsp;progress
        </div>
        <div
          className={`workspace-tile__stat${blocked > 0 ? ' workspace-tile__stat--bad' : ''}`}
        >
          <b>{blocked}</b>
          blocked
        </div>
      </div>
    </div>
  );
}

export interface DashboardProps {
  workspaces: WorkspaceData[];
  agents: Record<string, Agent>;
  activity: ActivityLine[];
  now?: Date;
  onOpenWorkspace: (id: string) => void;
}

export function Dashboard({
  workspaces,
  agents,
  activity,
  now = new Date(),
  onOpenWorkspace,
}: DashboardProps) {
  const totals = computeTotals(workspaces);
  const busyAgents = Object.values(agents).filter((a) => a.status === 'busy');

  return (
    <div className="dashboard">
      <div className="dashboard__summary-strip">
        <SummaryStat
          label="awaiting your input"
          value={totals.awaitingUser}
          accent="warn"
          hint={totals.awaitingUser > 0 ? 'targets need a reply' : 'all clear'}
        />
        <SummaryStat label="open targets" value={totals.targets} />
        <SummaryStat label="open gaps" value={totals.openGaps} />
        <SummaryStat label="active work" value={totals.work} />
        <SummaryStat
          label="stale audits"
          value={totals.stale}
          accent={totals.stale > 0 ? 'warn' : null}
        />
      </div>

      <HSection count={workspaces.length}>workspaces</HSection>

      <div className="tiles">
        {workspaces.map((ws) => (
          <WorkspaceTile
            key={ws.id}
            ws={ws}
            agents={agents}
            now={now}
            onOpen={() => onOpenWorkspace(ws.id)}
          />
        ))}
      </div>

      <div className="activity-section">
        <HSection>
          agent activity (last 30m){' '}
          <span style={{ marginLeft: 4, color: 'var(--ink-4)', fontSize: 10.5 }}>
            {busyAgents.length} active
          </span>
        </HSection>
        <div className="activity-card">
          <div className="activity-stream">
            {activity.slice(0, 10).map((line, i) => (
              <div key={i} className={`activity-line activity-line--${line.kind}`}>
                <span className="activity-line__time">{line.t}</span>
                <span className="activity-line__agent">{line.agent}</span>
                <span
                  className="activity-line__msg"
                  dangerouslySetInnerHTML={{ __html: line.msg }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

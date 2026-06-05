import { useState, useEffect, useCallback } from 'react';
import './Session.css';
import type { Target, Spec, Gap, WorkItem, PipelineStage, Agent } from '../types';
import { StatusPill } from '../components/StatusPill';
import { AgentChip } from '../components/AgentChip';
import { TargetDetail } from './Targets';

interface SessionProps {
  targets: Target[];
  specs: Spec[];
  gaps: Gap[];
  workItems: WorkItem[];
  staleDomains: string[];
  agents: Agent[];
  runTimestamp?: string;
  specVersion?: string;
  onNav: (section: string, id?: string) => void;
}

interface NextAction {
  text: string;
  cmd: string;
}

function computeNextAction(params: {
  awaitingUser: Target[];
  ready: Target[];
  staleDomains: string[];
  openGaps: Gap[];
  work: WorkItem[];
}): NextAction {
  const { awaitingUser, ready, staleDomains, openGaps, work } = params;

  if (awaitingUser.length > 0) {
    return {
      text: `${awaitingUser.length} target${awaitingUser.length === 1 ? '' : 's'} need your input.`,
      cmd: `/sdd:target-engage ${awaitingUser[0].id}`,
    };
  }
  if (ready.length > 0) {
    return {
      text: 'ready target waiting for spec reconciliation.',
      cmd: `/sdd:target-engage ${ready[0].id}`,
    };
  }
  if (staleDomains.length > 0) {
    return {
      text: 'stale audit — refresh before opening new work.',
      cmd: `/sdd:spec-audit ${staleDomains[0]}`,
    };
  }
  if (openGaps.length > 0) {
    return {
      text: 'open gaps — decompose into work items.',
      cmd: `/sdd:gap-to-work-items ${openGaps[0].abbrev}`,
    };
  }
  if (work.length > 0) {
    return {
      text: 'pending work — close the next item.',
      cmd: `/sdd:work-item-close ${work[0].id}`,
    };
  }
  return { text: 'all clear.', cmd: '/sdd:session-start' };
}

interface PipelineProps {
  stages: PipelineStage[];
  activeIdx: number;
}

function Pipeline({ stages, activeIdx }: PipelineProps) {
  return (
    <div className="pipeline">
      {stages.map((s, i) => (
        <div
          key={s.key}
          className={[
            'pipeline__stage',
            activeIdx === i ? 'pipeline__stage--active' : '',
            s.n === 0 ? 'pipeline__stage--empty' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <b>{s.n}</b>
          <span className="pipeline__stage-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

interface CategoryRowsProps {
  title: string;
  titleAlert?: boolean;
  count: number;
  children: React.ReactNode;
}

function CategoryRows({ title, titleAlert, count, children }: CategoryRowsProps) {
  return (
    <div className="session-cat">
      <div className="session-cat__head">
        <span
          className={`session-cat__title${titleAlert ? ' session-cat__title--alert' : ''}`}
        >
          {title}
        </span>
        <span className="session-cat__count">{count}</span>
        <span className="session-cat__rule" />
      </div>
      <div className="row-table">{children}</div>
    </div>
  );
}

interface CompactRowProps {
  id: string;
  title: string;
  meta: React.ReactNode;
  status: string;
  onClick: () => void;
}

function CompactRow({ id, title, meta, status, onClick }: CompactRowProps) {
  return (
    <div className="compact-row" onClick={onClick}>
      <span className="compact-row__id">{id}</span>
      <div className="compact-row__body">
        <div className="compact-row__title">{title}</div>
        <div className="compact-row__meta">{meta}</div>
      </div>
      <StatusPill status={status as Parameters<typeof StatusPill>[0]['status']} />
    </div>
  );
}

interface AwaitingUserRowProps {
  target: Target;
  onClick: () => void;
}

function AwaitingUserRow({ target, onClick }: AwaitingUserRowProps) {
  return (
    <div className="awaiting-user-row" onClick={onClick}>
      <span className="awaiting-user-row__id">{target.id}</span>
      <div className="awaiting-user-row__body">
        <div className="awaiting-user-row__title">{target.title}</div>
        <div className="awaiting-user-row__meta">
          <span>[{target.domain}]</span>
          <span>·</span>
          <span>{target.dialog.length} dialog turn{target.dialog.length === 1 ? '' : 's'}</span>
        </div>
      </div>
      <StatusPill status={target.status} />
    </div>
  );
}

export function Session({
  targets,
  specs,
  gaps,
  workItems,
  staleDomains,
  agents,
  runTimestamp,
  specVersion,
  onNav,
}: SessionProps) {
  const [panelTarget, setPanelTarget] = useState<Target | null>(null);

  const closePanel = useCallback(() => setPanelTarget(null), []);

  useEffect(() => {
    if (!panelTarget) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closePanel();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [panelTarget, closePanel]);

  const byStatus = (s: Target['status']) => targets.filter((t) => t.status === s);

  const awaitingUser = byStatus('awaiting-user');
  const awaitingAgent = byStatus('awaiting-agent');
  const ready = byStatus('ready');
  const draft = byStatus('draft');

  const openGaps = gaps.filter((g) => g.status === 'open');
  const inProgress = workItems.filter((w) => w.status === 'in-progress');
  const blocked = workItems.filter((w) => w.status === 'blocked');
  const pending = workItems.filter((w) => w.status === 'pending');
  const activeWork = [...inProgress, ...blocked, ...pending];

  const totalSpecItems = specs.reduce((a, s) => a + s.items.length, 0);
  const doneTodayCount = workItems.filter((w) => w.status === 'done').length;

  const pipelineStages: PipelineStage[] = [
    { key: 'targets', label: 'targets', n: targets.length },
    { key: 'specs', label: 'spec items', n: totalSpecItems },
    { key: 'gaps', label: 'open gaps', n: openGaps.length },
    { key: 'work', label: 'work items', n: pending.length + inProgress.length + blocked.length },
    { key: 'done', label: 'done today', n: doneTodayCount },
  ];

  const next = computeNextAction({ awaitingUser, ready, staleDomains, openGaps, work: activeWork });

  return (
    <div className={`session${panelTarget ? ' session--panel-open' : ''}`}>
      <div className="session__terminal">
        <div>
          <span className="session__terminal-prompt">$</span>
          <span className="session__terminal-cmd">/sdd:session-start</span>
          <span className="session__terminal-caret" />
        </div>
        {(runTimestamp || specVersion) && (
          <div className="session__terminal-meta">
            {runTimestamp && `ran ${runTimestamp}`}
            {specVersion && ` · spec version <${specVersion}>`}
          </div>
        )}
      </div>

      <Pipeline stages={pipelineStages} activeIdx={2} />

      {awaitingUser.length > 0 && (
        <CategoryRows
          title="▸ targets awaiting your input"
          titleAlert
          count={awaitingUser.length}
        >
          {awaitingUser.map((t) => (
            <AwaitingUserRow key={t.id} target={t} onClick={() => setPanelTarget(t)} />
          ))}
        </CategoryRows>
      )}

      {awaitingAgent.length > 0 && (
        <CategoryRows title="targets awaiting agent" count={awaitingAgent.length}>
          {awaitingAgent.map((t) => (
            <CompactRow
              key={t.id}
              id={t.id}
              title={t.title}
              meta={`[${t.domain}]`}
              status={t.status}
              onClick={() => setPanelTarget(t)}
            />
          ))}
        </CategoryRows>
      )}

      {ready.length > 0 && (
        <CategoryRows
          title="ready targets — pending spec reconciliation"
          count={ready.length}
        >
          {ready.map((t) => (
            <CompactRow
              key={t.id}
              id={t.id}
              title={t.title}
              meta={`[${t.domain}]`}
              status={t.status}
              onClick={() => setPanelTarget(t)}
            />
          ))}
        </CategoryRows>
      )}

      {draft.length > 0 && (
        <CategoryRows title="draft targets — not submitted" count={draft.length}>
          {draft.map((t) => (
            <CompactRow
              key={t.id}
              id={t.id}
              title={t.title || '(empty)'}
              meta={`[${t.domain}]`}
              status={t.status}
              onClick={() => setPanelTarget(t)}
            />
          ))}
        </CategoryRows>
      )}

      <div className="session-cat">
        <div className="session-cat__head">
          <span className="session-cat__title">specs</span>
          <span className="session-cat__count">{specs.length} domains</span>
          <span className="session-cat__rule" />
        </div>
        <div className="row-table">
          {specs.map((s) => {
            const isStale = staleDomains.includes(s.domain);
            return (
              <div
                key={s.id}
                className="compact-row"
                onClick={() => onNav('specs', s.id)}
              >
                <span className="compact-row__id">{s.id}</span>
                <div className="compact-row__body">
                  <div className="compact-row__title">{s.domain}</div>
                  <div className="compact-row__meta">
                    <span>{s.items.length} items</span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: 'var(--ink-4)',
                      }}
                    >
                      &lt;{s.version}&gt;
                    </span>
                    {isStale && (
                      <StatusPill status="stale" label="stale audit" />
                    )}
                  </div>
                </div>
                <button
                  className="btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNav('specs', s.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 11,
                    color: 'var(--ink-3)',
                    padding: '4px 8px',
                    flexShrink: 0,
                  }}
                >
                  view →
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {staleDomains.length > 0 && (
        <div className="stale-banner">
          <span className="stale-banner__icon">⚠</span>
          <b className="stale-banner__label">stale audits</b>
          <span className="stale-banner__sep">·</span>
          <span className="stale-banner__domains">{staleDomains.join(', ')}</span>
          <button
            className="stale-banner__action"
            style={{
              background: 'none',
              border: '1px solid var(--hair)',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 11,
              color: 'var(--ink-2)',
              padding: '4px 10px',
            }}
          >
            re-run /sdd:spec-audit
          </button>
        </div>
      )}

      {openGaps.length > 0 && (
        <CategoryRows title="open gaps" count={openGaps.length}>
          {openGaps.slice(0, 5).map((g) => (
            <CompactRow
              key={g.id}
              id={g.id}
              title={g.title}
              meta={
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: 'var(--accent)',
                  }}
                >
                  [{g.specItem}]
                </span>
              }
              status={g.status}
              onClick={() => onNav('gaps', g.id)}
            />
          ))}
          {openGaps.length > 5 && (
            <div
              style={{
                padding: '8px 16px',
                color: 'var(--ink-3)',
                fontSize: 11,
              }}
            >
              … and {openGaps.length - 5} more
            </div>
          )}
        </CategoryRows>
      )}

      <CategoryRows
        title="active work items"
        count={inProgress.length + blocked.length + pending.length}
      >
        {activeWork.slice(0, 5).map((w) => (
          <CompactRow
            key={w.id}
            id={w.id}
            title={w.title}
            meta={
              w.agent && agents.find((a) => a.id === w.agent) ? (
                <AgentChip agent={agents.find((a) => a.id === w.agent)!} />
              ) : null
            }
            status={w.status}
            onClick={() => onNav('work', w.id)}
          />
        ))}
      </CategoryRows>

      <div className="session__next-action">
        <div>
          <span className="session__next-label">next:</span>
          <span className="session__next-text">{next.text}</span>
        </div>
        <div className="session__next-cmd">
          <span className="session__terminal-prompt">$</span>
          <span className="session__terminal-cmd">{next.cmd}</span>
          <span className="session__terminal-caret" />
        </div>
      </div>

      {panelTarget && (
        <div className="session-target-panel" role="dialog" aria-modal="true">
          <div className="session-target-panel__header">
            <button
              className="session-target-panel__close"
              onClick={closePanel}
              aria-label="Close panel"
            >
              ✕
            </button>
          </div>
          <div className="session-target-panel__body">
            <TargetDetail target={panelTarget} />
          </div>
        </div>
      )}
    </div>
  );
}

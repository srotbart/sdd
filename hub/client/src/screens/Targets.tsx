import { useState } from 'react';
import './Targets.css';
import type { Target, TargetStatus } from '../types';
import { StatusPill } from '../components/StatusPill';
import { ArtifactList } from '../components/ArtifactList';

function fmtAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const sec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  return `${Math.floor(sec / 86400)}d`;
}

interface FilterTab {
  id: string;
  label: string;
  count: number;
}

interface TargetListRowProps {
  target: Target;
  isActive: boolean;
  onClick: () => void;
}

function TargetListRow({ target, isActive, onClick }: TargetListRowProps) {
  return (
    <div
      className={`target-row${isActive ? ' target-row--active' : ''}`}
      onClick={onClick}
    >
      <div className="target-row__header">
        <span className="target-row__id">{target.id}</span>
        <StatusPill status={target.status} />
        <span className="target-row__time">{fmtAgo(target.created)} ago</span>
      </div>
      <div className={`target-row__title${!target.title ? ' target-row__title--unnamed' : ''}`}>
        {target.title || '(unnamed draft)'}
      </div>
      <div className="target-row__footer">
        [{target.domain}]
        {target.dialog.length > 0 && (
          <> · {target.dialog.length} turn{target.dialog.length === 1 ? '' : 's'}</>
        )}
        {target.foldedInto && (
          <span className="target-row__folded"> · folded → {target.foldedInto}</span>
        )}
      </div>
    </div>
  );
}

function TurnBody({ text }: { text: string }) {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/(?:^|\n)(?:&gt;\s.+\n?)+/g, (m) => {
    const inner = m
      .split('\n')
      .filter(Boolean)
      .map((l) => l.replace(/^&gt;\s?/, ''))
      .join(' ');
    return `\n<blockquote style="border-left:2px solid var(--hair-2);padding-left:10px;margin:8px 0;color:var(--ink-2)">${inner}</blockquote>`;
  });

  html = html.replace(/`([^`]+)`/g, '<span style="font-family:\'JetBrains Mono\',monospace;font-size:11px;color:var(--accent)">$1</span>');
  html = html.replace(
    /(\n|^)(\d+)\.\s(.+)/g,
    '$1<div style="margin-left:18px"><span style="color:var(--ink-4);margin-right:6px">$2.</span>$3</div>',
  );
  html = html.replace(/\n/g, '<br/>');

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

interface TargetDetailProps {
  target: Target;
}

function TargetDetail({ target }: TargetDetailProps) {
  const [composer, setComposer] = useState('');
  const [editingStatement, setEditingStatement] = useState(false);

  const actionMap: Record<TargetStatus, { label: string; hint: string; primary: boolean }> = {
    'awaiting-user': {
      label: 'send reply',
      hint: 'sets status → awaiting-agent',
      primary: true,
    },
    'awaiting-agent': {
      label: 'add note',
      hint: 'agent will respond next session',
      primary: false,
    },
    ready: {
      label: 'reconcile with spec',
      hint: 'run /sdd:target-engage',
      primary: true,
    },
    draft: {
      label: 'submit for response',
      hint: 'sets status → awaiting-agent',
      primary: true,
    },
    accepted: { label: 'send', hint: '', primary: false },
  };

  const action = actionMap[target.status] ?? { label: 'send', hint: '', primary: false };

  const composerPlaceholder =
    target.status === 'awaiting-user'
      ? "answer the agent's questions, or revise the current statement…"
      : target.status === 'draft'
        ? 'describe your intent in plain language…'
        : 'add a note…';

  return (
    <div className="targets-detail">
      <div className="target-detail__header">
        <div className="target-detail__header-row">
          <span className="target-detail__id">{target.id}</span>
          <StatusPill status={target.status} />
          <span className="target-detail__domain-pill">
            <span className="target-detail__domain-led" />
            {target.domain}
          </span>
          <span className="target-detail__created">
            created {target.created.split('T')[0]}
          </span>
        </div>
        <h2 className={`target-detail__title${!target.title ? ' target-detail__title--unnamed' : ''}`}>
          {target.title || '(unnamed draft)'}
        </h2>
      </div>

      {target.status === 'ready' && (
        <div className="ready-banner">
          <span className="ready-banner__check">✓</span>
          <span className="ready-banner__text">
            target is settled. run{' '}
            <code>/sdd:target-engage {target.id}</code> to reconcile with{' '}
            <code>SPEC-{target.domainAbbrev}</code>.
          </span>
          <button className="ready-banner__action">fold into spec →</button>
        </div>
      )}

      <div className="target-detail__scroll">
        {target.statement && (
          <div className="target-statement">
            <div className="statement-block">
              <div className="statement-block__label">
                <span>current statement</span>
                <button
                  className="statement-block__edit-btn"
                  onClick={() => setEditingStatement(!editingStatement)}
                >
                  {editingStatement ? 'cancel' : 'edit'}
                </button>
              </div>
              {editingStatement ? (
                <textarea
                  className="statement-block__textarea"
                  defaultValue={target.statement}
                />
              ) : (
                <div className="statement-block__text">{target.statement}</div>
              )}
            </div>
          </div>
        )}

        <div className="dialog">
          {target.dialog.length === 0 && (
            <div className="dialog__empty">
              no dialog yet — describe your intent in current statement, then submit
            </div>
          )}
          {target.dialog.map((turn, i) => (
            <div
              key={i}
              className={`dialog-turn${turn.who === 'agent' ? ' dialog-turn--agent' : ''}`}
            >
              <div className="dialog-turn__who">
                {turn.who === 'agent' ? 'AGENT' : 'YOU'}
                <div className="dialog-turn__round">round&nbsp;{Math.floor(i / 2) + 1}</div>
              </div>
              <div className="dialog-turn__bubble">
                <span className="dialog-turn__timestamp">
                  {turn.date} · {turn.who === 'agent' ? 'cc-main' : 'you'}
                </span>
                <div className="dialog-turn__body">
                  <TurnBody text={turn.text} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="composer">
        <textarea
          className="composer__textarea"
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
          placeholder={composerPlaceholder}
        />
        <div className="composer__footer">
          <span className="composer__hint">
            <span className="composer__kbd">⌘</span>
            {' + '}
            <span className="composer__kbd">↵</span>
            {' to send'}
          </span>
          <div className="composer__actions">
            {target.status === 'awaiting-user' && (
              <button className="composer__btn" title="settle without further questions">
                mark ready
              </button>
            )}
            <button className={`composer__btn${action.primary ? ' composer__btn--primary' : ''}`}>
              {action.label}
            </button>
          </div>
        </div>
        {action.hint && <div className="composer__action-hint">{action.hint}</div>}
      </div>
    </div>
  );
}

export interface TargetsProps {
  targets: Target[];
  initialTargetId?: string;
}

export function Targets({ targets, initialTargetId }: TargetsProps) {
  const [activeId, setActiveId] = useState<string>(
    initialTargetId ?? targets[0]?.id ?? '',
  );
  const [filter, setFilter] = useState<string>('all');

  const activeTargets = targets.filter((t) => t.status !== 'accepted');
  const archivedTargets = targets.filter((t) => t.status === 'accepted');

  const statusFilters: FilterTab[] = [
    { id: 'all', label: 'all', count: targets.length },
    {
      id: 'awaiting-user',
      label: 'awaiting you',
      count: targets.filter((t) => t.status === 'awaiting-user').length,
    },
    {
      id: 'awaiting-agent',
      label: 'awaiting agent',
      count: targets.filter((t) => t.status === 'awaiting-agent').length,
    },
    {
      id: 'ready',
      label: 'ready',
      count: targets.filter((t) => t.status === 'ready').length,
    },
    {
      id: 'draft',
      label: 'draft',
      count: targets.filter((t) => t.status === 'draft').length,
    },
    {
      id: 'archived',
      label: 'archived',
      count: archivedTargets.length,
    },
  ];

  const filtered =
    filter === 'all'
      ? activeTargets
      : filter === 'archived'
        ? archivedTargets
        : targets.filter((t) => t.status === filter);

  const active = targets.find((t) => t.id === activeId);

  return (
    <div className="targets-root">
      <div className="targets-title-bar">
        <span className="targets-title-bullet">▪</span>
        <span className="targets-title-word">targets</span>
        <span className="targets-title-sub">— declared intent, negotiated to spec</span>
        <button className="targets-new-btn">+ new target</button>
      </div>
      <div className="targets-title-rule" />
    <div className="targets-layout">
      <div className="targets-list">
        <div className="targets-filter-bar">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              className={`filter-btn${filter === f.id ? ' filter-btn--active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              <span className="filter-btn__count">{f.count}</span>
            </button>
          ))}
        </div>
        <div className="targets-list-scroll">
          <ArtifactList
            items={filter === 'all' ? activeTargets : filtered}
            archivedItems={filter === 'all' ? archivedTargets : []}
            getKey={(t) => t.id}
            renderRow={(t) => (
              <TargetListRow
                key={t.id}
                target={t}
                isActive={t.id === activeId}
                onClick={() => setActiveId(t.id)}
              />
            )}
          />
        </div>
      </div>

      {active ? (
        <TargetDetail target={active} />
      ) : (
        <div className="targets-empty">select a target</div>
      )}
    </div>
    </div>
  );
}

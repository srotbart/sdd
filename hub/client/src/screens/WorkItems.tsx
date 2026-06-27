import { useState } from 'react';
import './WorkItems.css';
import { StatusPill } from '../components/StatusPill';
import { AgentChip } from '../components/AgentChip';
import { ArchiveFooter } from '../components/ArchiveFooter';
import { ArtifactIdLink } from '../components/ArtifactIdLink';
import { Markdown } from '../components/Markdown';
import type { WorkItem, Gap, Spec, Agent } from '../types';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function closedWithin24h(w: WorkItem): boolean {
  if (!w.closed) return false;
  return Date.now() - new Date(w.closed).getTime() < TWENTY_FOUR_HOURS_MS;
}

interface WorkItemsProps {
  workItems: WorkItem[];
  gaps: Gap[];
  specs: Spec[];
  agents: Agent[];
  initialWiId?: string;
  onNav: (tab: string, id?: string) => void;
}

function fmtAgo(dateStr: string): string {
  const sec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (sec < 60) return sec + 's';
  if (sec < 3600) return Math.floor(sec / 60) + 'm';
  if (sec < 86400) return Math.floor(sec / 3600) + 'h';
  return Math.floor(sec / 86400) + 'd';
}

export function WorkItems({ workItems, gaps, specs, agents, initialWiId, onNav }: WorkItemsProps) {
  const [drawerId, setDrawerId] = useState<string | null>(initialWiId ?? null);

  const archiveItems = workItems.filter(
    (w) => w.status === 'abandoned' || (w.status === 'done' && !closedWithin24h(w)),
  );

  const cols = [
    { id: 'pending',     label: 'pending',      color: 'var(--ink-4)',       items: workItems.filter((w) => w.status === 'pending') },
    { id: 'in-progress', label: 'in progress',  color: 'var(--st-progress)', items: workItems.filter((w) => w.status === 'in-progress') },
    { id: 'blocked',     label: 'blocked',      color: 'var(--st-blocked)',  items: workItems.filter((w) => w.status === 'blocked') },
    { id: 'done',        label: 'done · today', color: 'var(--st-done)',     items: workItems.filter((w) => w.status === 'done' && closedWithin24h(w)) },
  ];

  const active = workItems.find((w) => w.id === drawerId);

  return (
    <div className="wi-shell">
      <div className="wi-main">
        <div className="kanban">
          {cols.map((col) => (
            <div key={col.id} className="kanban-col">
              <div className="kanban-col__head">
                <span
                  className="kanban-col__dot"
                  style={{ background: col.color }}
                />
                {col.label}
                <span className="kanban-col__count">{col.items.length}</span>
              </div>
              <div className="kanban-col__body">
                {col.items.length === 0 ? (
                  <div className="kanban-col__empty">empty</div>
                ) : (
                  col.items.map((w) => (
                    <KanbanCard
                      key={w.id}
                      workItem={w}
                      agents={agents}
                      borderColor={col.color}
                      fmtAgo={fmtAgo}
                      onClick={() => setDrawerId(w.id)}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
        <ArchiveFooter
          items={archiveItems}
          agents={agents}
          onOpenItem={(id) => setDrawerId(id)}
          activeId={drawerId}
        />
      </div>

      {active && (
        <WorkItemDrawer
          workItem={active}
          gaps={gaps}
          specs={specs}
          agents={agents}
          onClose={() => setDrawerId(null)}
          onNav={onNav}
        />
      )}
    </div>
  );
}

interface KanbanCardProps {
  workItem: WorkItem;
  agents: Agent[];
  borderColor: string;
  fmtAgo: (d: string) => string;
  onClick: () => void;
}

function KanbanCard({ workItem: w, agents, borderColor, fmtAgo, onClick }: KanbanCardProps) {
  const agent = w.agent ? (agents.find((a) => a.id === w.agent) ?? null) : null;
  return (
    <div
      className="kcard"
      style={{ borderLeftColor: borderColor }}
      onClick={onClick}
    >
      <ArtifactIdLink id={w.id} className="kcard__id" />
      <div className="kcard__title">{w.title}</div>
      <div className="kcard__foot">
        {agent ? (
          <AgentChip agent={agent} />
        ) : (
          <span className="kcard__unassigned">unassigned</span>
        )}
        <span className="kcard__gap">↑ {w.gapId}</span>
      </div>
      {w.status === 'in-progress' && w.progressNote && (
        <div className="kcard__progress-note">
          ▸ {w.progressNote}
        </div>
      )}
      {w.status === 'blocked' && w.blockedReason && (
        <div className="kcard__blocked-reason">
          <span>⏸</span>
          <span>{w.blockedReason}</span>
        </div>
      )}
      {w.status === 'done' && w.closed && (
        <div className="kcard__done-time">
          closed {fmtAgo(w.closed)} ago
        </div>
      )}
    </div>
  );
}

interface WorkItemDrawerProps {
  workItem: WorkItem;
  gaps: Gap[];
  specs: Spec[];
  agents: Agent[];
  onClose: () => void;
  onNav: (tab: string, id?: string) => void;
}

function WorkItemDrawer({ workItem: wi, gaps, specs, agents, onClose, onNav }: WorkItemDrawerProps) {
  const gap = gaps.find((g) => g.id === wi.gapId);
  const specItem = gap
    ? specs.flatMap((s) => s.items).find((i) => i.id === gap.specItem)
    : undefined;
  const specParent = specItem
    ? specs.find((s) => s.items.some((i) => i.id === specItem.id))
    : undefined;
  const agent = wi.agent ? (agents.find((a) => a.id === wi.agent) ?? null) : null;

  return (
    <div className="wi-drawer">
      <div className="wi-drawer__header">
        <ArtifactIdLink id={wi.id} className="wi-drawer__id" />
        <StatusPill status={wi.status} />
        <button className="wi-drawer__close" onClick={onClose}>✕</button>
      </div>

      <div className="wi-drawer__body">
        <h2 className="wi-drawer__title">{wi.title}</h2>

        {wi.status === 'blocked' && wi.blockedReason && (
          <div className="wi-drawer__blocked-banner">
            <b>blocked:</b> {wi.blockedReason}
          </div>
        )}

        {agent && (
          <div className="wi-drawer__section">
            <div className="wi-drawer__eyebrow">working agent</div>
            <AgentChip agent={agent} />
          </div>
        )}

        <div className="wi-drawer__eyebrow">scope</div>
        <div className="wi-drawer__scope"><Markdown>{wi.scope}</Markdown></div>

        <div className="wi-drawer__eyebrow">acceptance criteria</div>
        <ul className="wi-drawer__criteria">
          {wi.acceptance.map((a, i) => (
            <li
              key={i}
              className="wi-drawer__criterion"
              style={{
                borderBottom:
                  i < wi.acceptance.length - 1 ? '1px solid var(--hair)' : 'none',
              }}
            >
              <span className={wi.status === 'done' ? 'wi-drawer__check--done' : 'wi-drawer__check--open'}>
                {wi.status === 'done' ? '✓' : '○'}
              </span>
              <span>{a}</span>
            </li>
          ))}
        </ul>

        {wi.progressNote && wi.status === 'in-progress' && (
          <div className="wi-drawer__section">
            <div className="wi-drawer__eyebrow">latest from agent</div>
            <div className="wi-drawer__progress-note">▸ {wi.progressNote}</div>
          </div>
        )}

        {gap && (
          <div className="wi-drawer__section">
            <div className="wi-drawer__eyebrow">closing gap</div>
            <div className="wi-drawer__linked-card" onClick={() => onNav('gaps', gap.id)}>
              <div className="wi-drawer__linked-card-top">
                <span className="wi-drawer__linked-id">{gap.id}</span>
                <StatusPill status={gap.status} />
              </div>
              <div className="wi-drawer__linked-title">{gap.title}</div>
              <div className="wi-drawer__linked-loc">
                <span className="wi-drawer__linked-path">{gap.location.split(':')[0]}</span>
                <span className="wi-drawer__linked-lnum">:{gap.location.split(':')[1]}</span>
              </div>
            </div>
          </div>
        )}

        {specItem && specParent && (
          <div className="wi-drawer__section">
            <div className="wi-drawer__eyebrow">tracing to spec</div>
            <div
              className="wi-drawer__spec-trace"
              onClick={() => onNav('specs', specParent.id)}
            >
              <div className="wi-drawer__spec-trace-id">{specItem.id}</div>
              <div className="wi-drawer__spec-trace-title">{specItem.title}</div>
            </div>
          </div>
        )}

        <div className="wi-drawer__actions">
          {wi.status === 'pending' && (
            <button className="wi-btn wi-btn--primary">▸ assign agent + start</button>
          )}
          {wi.status === 'in-progress' && (
            <button className="wi-btn wi-btn--primary">/sdd:work-item-close {wi.id}</button>
          )}
          {wi.status === 'blocked' && (
            <button className="wi-btn">unblock</button>
          )}
          <button className="wi-btn wi-btn--ghost">abandon</button>
        </div>
      </div>
    </div>
  );
}

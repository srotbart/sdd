import { useState, useMemo } from 'react';
import './ArchiveFooter.css';
import { StatusPill } from './StatusPill';
import { AgentChip } from './AgentChip';
import type { WorkItem, Agent } from '../types';

interface ArchiveFooterProps {
  items: WorkItem[];
  agents: Record<string, Agent>;
  onOpenItem: (id: string) => void;
  activeId: string | null;
}

type StatusFilter = 'all' | 'done' | 'abandoned';

function fmtLastClosed(items: WorkItem[]): string {
  const closed = items
    .map((w) => w.closed ? new Date(w.closed).getTime() : 0)
    .filter(Boolean);
  if (closed.length === 0) return '';
  const latest = Math.max(...closed);
  const sec = Math.floor((Date.now() - latest) / 1000);
  if (sec < 60) return sec + 's ago';
  if (sec < 3600) return Math.floor(sec / 60) + 'm ago';
  if (sec < 86400) return Math.floor(sec / 3600) + 'h ago';
  return Math.floor(sec / 86400) + 'd ago';
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const t = d.getTime();
  if (t >= todayStart) return 'Today';
  if (t >= yesterdayStart) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

function groupByDay(items: WorkItem[]): { label: string; items: WorkItem[] }[] {
  const map = new Map<string, WorkItem[]>();
  const sorted = [...items].sort((a, b) => {
    const at = a.closed ? new Date(a.closed).getTime() : 0;
    const bt = b.closed ? new Date(b.closed).getTime() : 0;
    return bt - at;
  });
  for (const item of sorted) {
    const label = item.closed ? dayLabel(item.closed) : 'Unknown';
    if (!map.has(label)) {
      map.set(label, []);
    }
    map.get(label)!.push(item);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

export function ArchiveFooter({ items, agents, onOpenItem, activeId }: ArchiveFooterProps) {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [domainFilter, setDomainFilter] = useState<string | null>(null);

  const lastClosed = useMemo(() => fmtLastClosed(items), [items]);

  const domains = useMemo(() => {
    const set = new Set(items.map((w) => w.domain).filter(Boolean));
    return Array.from(set).sort();
  }, [items]);

  const doneCnt = items.filter((w) => w.status === 'done').length;
  const abandonedCnt = items.filter((w) => w.status === 'abandoned').length;

  const filtered = useMemo(() => {
    let result = items;
    if (statusFilter !== 'all') {
      result = result.filter((w) => w.status === statusFilter);
    }
    if (domainFilter) {
      result = result.filter((w) => w.domain === domainFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.id.toLowerCase().includes(q) ||
          w.title.toLowerCase().includes(q) ||
          w.gapId?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [items, statusFilter, domainFilter, search]);

  const groups = useMemo(() => groupByDay(filtered), [filtered]);

  function handleToggle() {
    if (expanded) {
      setSearch('');
      setStatusFilter('all');
      setDomainFilter(null);
    }
    setExpanded((e) => !e);
  }

  if (items.length === 0) return null;

  return (
    <div className={`archive-footer ${expanded ? 'archive-footer--expanded' : ''}`}>
      <div className="archive-footer__bar" onClick={handleToggle}>
        <span className="archive-footer__caret">{expanded ? '▾' : '▸'}</span>
        <span className="archive-footer__label">archive</span>
        <span className="archive-footer__count">{items.length}</span>
        {!expanded && lastClosed && (
          <span className="archive-footer__last-closed">last closed {lastClosed}</span>
        )}
        {expanded && (
          <div className="archive-footer__controls" onClick={(e) => e.stopPropagation()}>
            <div className="archive-footer__search-wrap">
              <span className="archive-footer__search-icon">⌕</span>
              <input
                className="archive-footer__search"
                placeholder="search archive…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="archive-footer__filters">
              {(['all', 'done', 'abandoned'] as StatusFilter[]).map((s) => {
                const cnt = s === 'all' ? items.length : s === 'done' ? doneCnt : abandonedCnt;
                return (
                  <button
                    key={s}
                    className={`archive-footer__filter-btn ${statusFilter === s ? 'archive-footer__filter-btn--active' : ''}`}
                    onClick={() => setStatusFilter(s)}
                  >
                    {s} <span className="archive-footer__filter-cnt">{cnt}</span>
                  </button>
                );
              })}
            </div>
            {domains.length > 0 && (
              <div className="archive-footer__filters">
                <button
                  className={`archive-footer__filter-btn ${domainFilter === null ? 'archive-footer__filter-btn--active' : ''}`}
                  onClick={() => setDomainFilter(null)}
                >
                  all domains
                </button>
                {domains.map((d) => (
                  <button
                    key={d}
                    className={`archive-footer__filter-btn ${domainFilter === d ? 'archive-footer__filter-btn--active' : ''}`}
                    onClick={() => setDomainFilter(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {expanded && (
        <div className="archive-footer__body">
          {groups.map((group) => (
            <div key={group.label} className="archive-footer__day-col">
              <div className="archive-footer__day-label">{group.label}</div>
              {group.items.map((w) => {
                const agent = w.agent ? agents[w.agent] : null;
                return (
                  <div
                    key={w.id}
                    className={`arch-card ${w.status === 'abandoned' ? 'arch-card--abandoned' : ''} ${activeId === w.id ? 'arch-card--active' : ''}`}
                    style={{
                      borderLeftColor: w.status === 'done' ? 'var(--st-done)' : 'var(--ink-4)',
                    }}
                    onClick={() => onOpenItem(w.id)}
                  >
                    <div className="arch-card__id">{w.id}</div>
                    <StatusPill status={w.status as any} />
                    <div className="arch-card__title">{w.title}</div>
                    <div className="arch-card__foot">
                      {agent ? (
                        <AgentChip agent={agent} />
                      ) : (
                        <span className="arch-card__unassigned">unassigned</span>
                      )}
                      {w.gapId && <span className="arch-card__gap">{w.gapId}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {groups.length === 0 && (
            <div className="archive-footer__empty">no items match</div>
          )}
        </div>
      )}
    </div>
  );
}

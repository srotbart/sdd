import { useState } from 'react';
import './Gaps.css';
import { StatusPill } from '../components/StatusPill';
import { ArtifactList } from '../components/ArtifactList';
import type { Gap, Spec, WorkItem } from '../types';

interface GapsProps {
  gaps: Gap[];
  specs: Spec[];
  workItems: WorkItem[];
  initialGapId?: string;
  onNav: (tab: string, id?: string) => void;
}

export function Gaps({ gaps, specs, workItems, initialGapId, onNav }: GapsProps) {
  const [activeId, setActiveId] = useState<string>(
    initialGapId ?? gaps[0]?.id ?? ''
  );
  const [filterDomain, setFilterDomain] = useState<string>('all');

  const domains = ['all', ...Array.from(new Set(gaps.map((g) => g.domain)))];

  const domainFiltered =
    filterDomain === 'all' ? gaps : gaps.filter((g) => g.domain === filterDomain);

  const TERMINAL_STATUSES = new Set(['closed', 'deferred', 'accepted']);
  const activeGaps = domainFiltered.filter((g) => !TERMINAL_STATUSES.has(g.status));
  const archivedGaps = domainFiltered.filter((g) => TERMINAL_STATUSES.has(g.status));

  const active = gaps.find((g) => g.id === activeId);

  function fmtAgo(dateStr: string): string {
    const sec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (sec < 60) return sec + 's';
    if (sec < 3600) return Math.floor(sec / 60) + 'm';
    if (sec < 86400) return Math.floor(sec / 3600) + 'h';
    return Math.floor(sec / 86400) + 'd';
  }

  return (
    <div className="gaps-layout">
      <div className="gaps-list">
        <div className="gaps-filter-bar">
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setFilterDomain(d)}
              className={`gaps-filter-btn${filterDomain === d ? ' gaps-filter-btn--active' : ''}`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="gaps-list__scroll">
          <ArtifactList
            items={activeGaps}
            archivedItems={archivedGaps}
            getKey={(g) => g.id}
            renderRow={(g) => (
              <div
                key={g.id}
                className={`gaps-row${activeId === g.id ? ' gaps-row--active' : ''}`}
                onClick={() => setActiveId(g.id)}
              >
                <div className="gaps-row__top">
                  <span className="gaps-row__id">{g.id}</span>
                  <StatusPill status={g.status} />
                  {g.closedBy && (
                    <span className="gaps-row__closer-pill">
                      <span className="gaps-row__closer-led" />
                      {g.closedBy}
                    </span>
                  )}
                </div>
                <div className="gaps-row__title">{g.title}</div>
                <div className="gaps-row__loc">
                  <span className="gaps-row__path">{g.location.split(':')[0]}</span>
                  <span className="gaps-row__lnum">:{g.location.split(':')[1]}</span>
                </div>
                <div className="gaps-row__meta">
                  ↑ {g.specItem} · audited &lt;{g.auditVersion}&gt; · {fmtAgo(g.discovered)} ago
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {active ? (
        <GapDetail
          gap={active}
          specs={specs}
          workItems={workItems}
          fmtAgo={fmtAgo}
          onNav={onNav}
        />
      ) : (
        <div className="gaps-empty">select a gap</div>
      )}
    </div>
  );
}

interface GapDetailProps {
  gap: Gap;
  specs: Spec[];
  workItems: WorkItem[];
  fmtAgo: (d: string) => string;
  onNav: (tab: string, id?: string) => void;
}

function GapDetail({ gap, specs, workItems, fmtAgo, onNav }: GapDetailProps) {
  const specItem = specs.flatMap((s) => s.items).find((i) => i.id === gap.specItem);
  const specParent = specItem
    ? specs.find((s) => s.items.some((i) => i.id === specItem.id))
    : undefined;
  const closer = workItems.find((w) => w.id === gap.closedBy);

  function renderReasoning(text: string) {
    return text.replace(/`([^`]+)`/g, '<span class="gaps-code">$1</span>');
  }

  return (
    <div className="gap-detail">
      <div className="gap-detail__header">
        <div className="gap-detail__header-top">
          <span className="gap-detail__id">{gap.id}</span>
          <StatusPill status={gap.status} />
          {gap.closedBy ? (
            <button
              className="gaps-addressed-pill"
              onClick={() => onNav('work items', gap.closedBy ?? undefined)}
            >
              <span className="gaps-addressed-pill__led" />
              addressed by {gap.closedBy}
            </button>
          ) : (
            <button className="btn-primary gaps-create-wi">+ create work item</button>
          )}
        </div>
        <h2 className="gap-detail__title">{gap.title}</h2>
      </div>

      <div className="gap-detail__body">
        <div className="gap-detail__main">
          <div className="gap-eyebrow">location</div>
          <div className="gap-location-bar">
            <span className="gap-location-bar__icon">📄</span>
            <span className="gap-location-bar__path">{gap.location.split(':')[0]}</span>
            <span className="gap-location-bar__lnum">:{gap.location.split(':')[1]}</span>
            <span className="gap-location-bar__jump">jump to source ↗</span>
          </div>

          <div className="gap-eyebrow">reasoning</div>
          <div
            className="gap-reasoning"
            dangerouslySetInnerHTML={{ __html: renderReasoning(gap.reasoning) }}
          />

          <div className="gap-eyebrow">code context</div>
          <CodeView context={gap.codeContext} />
        </div>

        <div className="gap-detail__rail">
          <div className="gap-eyebrow">spec item</div>
          {specItem && (
            <div
              className="gap-rail-card"
              onClick={() => onNav('specs', specParent?.id)}
            >
              <div className="gap-rail-card__id-row">
                <span className="gap-rail-card__id">{specItem.id}</span>
                <StatusPill status="active" />
              </div>
              <div className="gap-rail-card__title">{specItem.title}</div>
              <div className="gap-rail-card__body">
                {specItem.body.slice(0, 140)}&hellip;
              </div>
            </div>
          )}

          <div className="gap-eyebrow">audit metadata</div>
          <div className="gap-audit-meta">
            <div>
              <span className="gap-audit-meta__key">discovered</span>{' '}
              {gap.discovered.split('T')[0]} ({fmtAgo(gap.discovered)} ago)
            </div>
            <div>
              <span className="gap-audit-meta__key">spec version</span>{' '}
              &lt;{gap.auditVersion}&gt;
            </div>
            <div>
              <span className="gap-audit-meta__key">status</span> {gap.status}
            </div>
          </div>

          {closer && (
            <div className="gap-closer-section">
              <div className="gap-eyebrow">work item</div>
              <div
                className="gap-rail-card"
                onClick={() => onNav('work items', closer.id)}
              >
                <div className="gap-rail-card__id-row">
                  <span className="gap-rail-card__id">{closer.id}</span>
                  <StatusPill status={closer.status} />
                </div>
                <div className="gap-rail-card__title">{closer.title}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CodeViewProps {
  context: Gap['codeContext'];
}

function CodeView({ context }: CodeViewProps) {
  if (!context) return null;
  return (
    <div className="gap-codeview">
      {context.lines.map((ln, i) => (
        <div key={i} className={`gap-codeview__line${ln.hl ? ' gap-codeview__line--hl' : ''}`}>
          <span className="gap-codeview__lnum">{ln.n}</span>
          <span
            className="gap-codeview__src"
            dangerouslySetInnerHTML={{ __html: highlightPython(ln.src) }}
          />
        </div>
      ))}
    </div>
  );
}

function highlightPython(src: string): string {
  if (!src) return '&nbsp;';
  let s = src
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  s = s.replace(/(#.*$)/, '<span class="gap-hl-com">$1</span>');
  s = s.replace(/("[^"]*"|'[^']*')/g, '<span class="gap-hl-str">$1</span>');
  s = s.replace(
    /\b(def|return|with|for|in|if|not|None|True|False|import|from|as|class|raise|while|else|elif|try|except|finally|pass|yield|lambda|async|await)\b/g,
    '<span class="gap-hl-kw">$1</span>'
  );
  s = s.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\(/g, '<span class="gap-hl-fn">$1</span>(');
  s = s.replace(/\b(\d+)\b/g, '<span class="gap-hl-num">$1</span>');
  return s;
}

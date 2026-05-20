import { useState, useEffect, useRef, useCallback } from 'react';
import './CommandPalette.css';
import { StatusPill } from './StatusPill';
import type { Target, Gap, WorkItem, Spec } from '../types';

type Kind = 'target' | 'gap' | 'work-item' | 'spec-item' | 'spec-file';

interface Result {
  kind: Kind;
  id: string;
  title: string;
  status: string;
  meta: string;
  score: number;
}

const KIND_GLYPH: Record<Kind, string> = {
  'target': '▸',
  'gap': '≠',
  'work-item': '□',
  'spec-item': '∎',
  'spec-file': '∎',
};

const KIND_LABEL: Record<Kind, string> = {
  'target': 'targets',
  'gap': 'gaps',
  'work-item': 'work items',
  'spec-item': 'spec items',
  'spec-file': 'spec files',
};

function highlight(text: string, query: string): string {
  if (!query) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const escapedQuery = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escaped.replace(new RegExp(`(${escapedQuery})`, 'gi'), '<mark class="cp-mark">$1</mark>');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function scoreItem(id: string, title: string, body: string, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  let score = 0;
  if (id.toLowerCase().includes(q)) score += 1.6;
  if (title.toLowerCase().includes(q)) score += 1.2;
  if (body.toLowerCase().includes(q)) score += 0.7;
  return score;
}

function buildResults(
  query: string,
  targets: Target[],
  gaps: Gap[],
  workItems: WorkItem[],
  specs: Spec[],
): Result[] {
  const results: Result[] = [];

  if (!query) {
    targets.slice(0, 4).forEach((t) => {
      results.push({ kind: 'target', id: t.id, title: t.title || t.statement, status: t.status, meta: t.domain, score: 0 });
    });
    gaps.slice(0, 3).forEach((g) => {
      results.push({ kind: 'gap', id: g.id, title: g.title, status: g.status, meta: g.location, score: 0 });
    });
    workItems.slice(0, 3).forEach((w) => {
      results.push({ kind: 'work-item', id: w.id, title: w.title, status: w.status, meta: w.gapId, score: 0 });
    });
    return results;
  }

  targets.forEach((t) => {
    const score = scoreItem(t.id, t.title || '', t.statement, query);
    if (score > 0) {
      results.push({ kind: 'target', id: t.id, title: t.title || t.statement, status: t.status, meta: t.domain, score });
    }
  });

  gaps.forEach((g) => {
    const score = scoreItem(g.id, g.title, g.reasoning, query);
    if (score > 0) {
      results.push({ kind: 'gap', id: g.id, title: g.title, status: g.status, meta: g.location, score });
    }
  });

  workItems.forEach((w) => {
    const score = scoreItem(w.id, w.title, w.scope, query);
    if (score > 0) {
      results.push({ kind: 'work-item', id: w.id, title: w.title, status: w.status, meta: w.gapId, score });
    }
  });

  specs.forEach((spec) => {
    spec.items.forEach((item) => {
      const score = scoreItem(item.id, item.title, item.body, query);
      if (score > 0) {
        results.push({ kind: 'spec-item', id: item.id, title: item.title, status: item.status, meta: spec.domain, score });
      }
    });
    const score = scoreItem(spec.id, spec.domain, '', query);
    if (score > 0) {
      results.push({ kind: 'spec-file', id: spec.id, title: spec.domain, status: 'active', meta: spec.abbrev, score });
    }
  });

  return results.sort((a, b) => b.score - a.score).slice(0, 30);
}

const KIND_ORDER: Kind[] = ['target', 'gap', 'work-item', 'spec-item', 'spec-file'];

function groupResults(results: Result[]): Array<{ kind: Kind; items: Result[] }> {
  const groups = new Map<Kind, Result[]>();
  for (const r of results) {
    if (!groups.has(r.kind)) groups.set(r.kind, []);
    groups.get(r.kind)!.push(r);
  }
  return KIND_ORDER.filter((k) => groups.has(k)).map((k) => ({ kind: k, items: groups.get(k)! }));
}

export interface CommandPaletteProps {
  targets: Target[];
  gaps: Gap[];
  workItems: WorkItem[];
  specs: Spec[];
  activeWorkspaceName?: string;
  onNavigate: (kind: Kind, id: string) => void;
  onClose: () => void;
}

export function CommandPalette({
  targets,
  gaps,
  workItems,
  specs,
  activeWorkspaceName,
  onNavigate,
  onClose,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const results = buildResults(query, targets, gaps, workItems, specs);
  const groups = groupResults(results);
  const flatResults = groups.flatMap((g) => g.items);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, flatResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        const r = flatResults[selectedIdx];
        if (r) {
          onNavigate(r.kind, r.id);
          onClose();
        }
      }
    },
    [flatResults, selectedIdx, onClose, onNavigate],
  );

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }

  let flatIdx = 0;

  return (
    <div className="cp-overlay" ref={overlayRef} onClick={handleOverlayClick} data-testid="cp-overlay">
      <div className="cp-dialog" onKeyDown={handleKeyDown}>
        <div className="cp-input-row">
          <span className="cp-glyph">⌕</span>
          <input
            ref={inputRef}
            className="cp-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search targets, specs, gaps, work items…"
          />
          {activeWorkspaceName && (
            <span className="cp-scope-chip">{activeWorkspaceName}</span>
          )}
        </div>

        <div className="cp-results">
          {groups.length === 0 && (
            <div className="cp-empty">{query ? 'No results' : 'Start typing to search'}</div>
          )}
          {groups.map((group) => (
            <div key={group.kind} className="cp-group">
              <div className="cp-group__header">{KIND_LABEL[group.kind]}</div>
              {group.items.map((r) => {
                const isSelected = flatIdx === selectedIdx;
                const currentIdx = flatIdx++;
                return (
                  <div
                    key={r.id}
                    className={`cp-row${isSelected ? ' cp-row--selected' : ''}`}
                    onClick={() => { onNavigate(r.kind, r.id); onClose(); }}
                    onMouseEnter={() => setSelectedIdx(currentIdx)}
                  >
                    <span className="cp-row__glyph">{KIND_GLYPH[r.kind]}</span>
                    <span
                      className="cp-row__id"
                      dangerouslySetInnerHTML={{ __html: highlight(r.id, query) }}
                    />
                    <span
                      className="cp-row__title"
                      dangerouslySetInnerHTML={{ __html: highlight(r.title, query) }}
                    />
                    <StatusPill status={r.status as Parameters<typeof StatusPill>[0]['status']} />
                    <span className="cp-row__meta">{r.meta}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="cp-footer">
          <span className="cp-footer__hints">
            <span className="cp-kbd">↑↓</span> navigate
            <span className="cp-kbd">↵</span> open
            <span className="cp-kbd">esc</span> close
          </span>
          <span className="cp-footer__count">{results.length} result{results.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}

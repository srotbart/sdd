import { useState, useEffect, useRef, useCallback } from 'react';
import { Markdown } from '../components/Markdown';
import './Projections.css';
import type { Projection } from '../types';

interface ProjectionsProps {
  workspaceId: string;
  refreshToken?: number;
}

interface CommentEntry {
  id: string;
  action: 'clarify' | 're-evaluate' | 'expand' | 'condense';
  selectedText: string;
  line: number;
  note: string;
  createdAt: string;
}

type CommentAction = CommentEntry['action'];

const ACTIONS: CommentAction[] = ['clarify', 're-evaluate', 'expand', 'condense'];

function fmtAgo(dateStr: string): string {
  const sec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (sec < 60) return sec + 's ago';
  if (sec < 3600) return Math.floor(sec / 60) + 'm ago';
  if (sec < 86400) return Math.floor(sec / 3600) + 'h ago';
  return Math.floor(sec / 86400) + 'd ago';
}

/**
 * Build a regex from `text` that escapes regex specials and treats every run of whitespace as
 * flexible (`\s+`). A browser selection serializes soft line breaks / whitespace runs as single
 * spaces, but the raw markdown source and the rendered DOM text nodes preserve the original
 * newline — so exact matching fails on any selection that crosses a soft-wrapped line. Matching
 * whitespace-flexibly bridges that gap.
 */
function buildFlexibleRegex(text: string): RegExp {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped.replace(/\s+/g, '\\s+'));
}

/** Derive 1-based line number of first occurrence of selectedText in raw markdown. */
function deriveLineNumber(raw: string, selectedText: string): number {
  const m = buildFlexibleRegex(selectedText).exec(raw);
  if (!m) return 1;
  return raw.slice(0, m.index).split('\n').length;
}

/** Build a map of selectedText → comment entries for highlight rendering. */
function buildHighlightMap(comments: CommentEntry[]): Map<string, CommentEntry[]> {
  const map = new Map<string, CommentEntry[]>();
  for (const c of comments) {
    const key = c.selectedText;
    const existing = map.get(key) ?? [];
    map.set(key, [...existing, c]);
  }
  return map;
}

/**
 * Wrap occurrences of highlightedTexts within a rendered markdown container.
 * Uses a TreeWalker to find text nodes and wraps matching substrings with <mark> elements.
 */
function applyHighlights(container: HTMLElement, highlightMap: Map<string, CommentEntry[]>): void {
  if (highlightMap.size === 0) return;

  // Collect all text nodes
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  const textNodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }

  // Build matchers longest-key-first to prefer more specific matches. Each matcher tolerates
  // whitespace differences (selection collapses newlines/runs to single spaces; the DOM text
  // node preserves the original newline), so soft-wrapped selections still highlight.
  const matchers = [...highlightMap.keys()]
    .sort((a, b) => b.length - a.length)
    .map((key) => ({ re: buildFlexibleRegex(key), entries: highlightMap.get(key) ?? [] }));

  for (const textNode of textNodes) {
    // Skip if already inside a .proj-comment-mark
    if ((textNode.parentElement as HTMLElement)?.closest?.('.proj-comment-mark')) continue;

    const value = textNode.nodeValue ?? '';
    let changed = false;
    const fragment = document.createDocumentFragment();
    let remaining = value;

    while (remaining.length > 0) {
      let bestIdx = -1;
      let bestMatch = '';
      let bestEntries: CommentEntry[] = [];

      for (const { re, entries } of matchers) {
        const m = re.exec(remaining);
        if (m && m[0].length > 0 && (bestIdx === -1 || m.index < bestIdx)) {
          bestIdx = m.index;
          bestMatch = m[0];
          bestEntries = entries;
        }
      }

      if (bestIdx === -1) {
        fragment.appendChild(document.createTextNode(remaining));
        break;
      }

      // Text before the match
      if (bestIdx > 0) {
        fragment.appendChild(document.createTextNode(remaining.slice(0, bestIdx)));
      }

      // The matched text (with its original whitespace) wrapped in a mark
      const entries = bestEntries;
      const mark = document.createElement('mark');
      mark.className = 'proj-comment-mark';
      mark.textContent = bestMatch;

      // Tooltip content (aggregate all comments on this text)
      const tooltipLines = entries.map(
        (e) => `[${e.action}] ${new Date(e.createdAt).toLocaleString()}${e.note ? ' — ' + e.note : ''}`
      );
      mark.setAttribute('data-tooltip', tooltipLines.join('\n'));
      mark.setAttribute('data-action', entries.map((e) => e.action[0]).join(''));

      // Tiny label: first action initial(s)
      const label = document.createElement('sup');
      label.className = 'proj-comment-label';
      label.textContent = entries.map((e) => e.action[0]).join('');
      mark.appendChild(label);

      fragment.appendChild(mark);
      changed = true;

      remaining = remaining.slice(bestIdx + bestMatch.length);
    }

    if (changed && textNode.parentNode) {
      textNode.parentNode.replaceChild(fragment, textNode);
    }
  }
}

export function Projections({ workspaceId, refreshToken }: ProjectionsProps) {
  const [projections, setProjections] = useState<Projection[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentEntry[]>([]);

  // Text-selection marker state
  const [markerPos, setMarkerPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');

  // Action menu state
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [pendingAction, setPendingAction] = useState<CommentAction | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  const bodyRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load projections list
  useEffect(() => {
    fetch(`/workspaces/${workspaceId}/projections`)
      .then((r) => r.json())
      .then((data: Projection[]) => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
        );
        setProjections(sorted);
        if (sorted.length > 0 && !selectedName) {
          setSelectedName(sorted[0].name);
        }
      })
      .catch(() => {});
  }, [workspaceId, refreshToken]);

  // Load projection content
  useEffect(() => {
    if (!selectedName) { setContent(null); return; }
    fetch(`/workspaces/${workspaceId}/projections/${selectedName}`)
      .then((r) => r.ok ? r.text() : Promise.reject(r.status))
      .then((text) => setContent(text))
      .catch(() => setContent(null));
  }, [workspaceId, selectedName, refreshToken]);

  // Load comments for current projection
  useEffect(() => {
    if (!selectedName) { setComments([]); return; }
    fetch(`/workspaces/${workspaceId}/projections/${selectedName}/comments`)
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data: CommentEntry[]) => setComments(Array.isArray(data) ? data : []))
      .catch(() => setComments([]));
  }, [workspaceId, selectedName, refreshToken]);

  // Apply highlights whenever content or comments change
  useEffect(() => {
    const container = bodyRef.current;
    if (!container || comments.length === 0) return;

    // Remove old marks first. Drop the label <sup> before reading textContent so the original
    // marked text is restored exactly (no fragile trailing-letter stripping).
    container.querySelectorAll('.proj-comment-mark').forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        el.querySelector('.proj-comment-label')?.remove();
        parent.replaceChild(document.createTextNode(el.textContent ?? ''), el);
        parent.normalize();
      }
    });

    const map = buildHighlightMap(comments);
    applyHighlights(container, map);
  }, [content, comments]);

  // Track text selection to show marker icon
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Don't trigger when clicking inside the menu
    if (menuRef.current?.contains(e.target as Node)) return;

    const sel = window.getSelection();
    const text = sel?.toString().trim() ?? '';
    if (text.length === 0) {
      setMarkerPos(null);
      setSelectedText('');
      return;
    }

    const range = sel?.getRangeAt(0);
    if (!range) return;

    const rect = range.getBoundingClientRect();
    const containerRect = bodyRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    setSelectedText(text);
    setMarkerPos({
      x: rect.right - containerRect.left + (bodyRef.current?.scrollLeft ?? 0),
      y: rect.top - containerRect.top + (bodyRef.current?.scrollTop ?? 0) - 28,
    });
    // Close any open menu
    setMenuPos(null);
    setPendingAction(null);
    setNoteText('');
  }, []);

  // Open action menu when marker is clicked
  const handleMarkerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!markerPos) return;
    setMenuPos({ x: markerPos.x, y: markerPos.y });
    setMarkerPos(null);
  }, [markerPos]);

  // Dismiss menu/marker when clicking outside
  const handleBodyClick = useCallback((e: React.MouseEvent) => {
    if (menuRef.current?.contains(e.target as Node)) return;
    const sel = window.getSelection();
    if (!sel || sel.toString().trim().length === 0) {
      setMarkerPos(null);
      setMenuPos(null);
      setPendingAction(null);
      setNoteText('');
    }
  }, []);

  // Confirm and persist a comment
  const handleConfirm = useCallback(async () => {
    if (!pendingAction || !selectedText || !selectedName || !content) return;

    const line = deriveLineNumber(content, selectedText);
    const entry: CommentEntry = {
      id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      action: pendingAction,
      selectedText,
      line,
      note: noteText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [...comments, entry];
    try {
      await fetch(`/workspaces/${workspaceId}/projections/${selectedName}/comments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      setComments(updated);
    } catch {
      // ignore
    }

    // Reset
    setMenuPos(null);
    setPendingAction(null);
    setNoteText('');
    setSelectedText('');
    window.getSelection()?.removeAllRanges();
  }, [pendingAction, selectedText, selectedName, content, noteText, comments, workspaceId]);

  return (
    <div className="projections-root">
      <div className="projections-layout">
        <div className="projections-sidebar">
          <div className="projections-sidebar__label">projections</div>
          {projections.length === 0 ? (
            <div className="projections-empty">no projections yet</div>
          ) : (
            projections.map((p) => (
              <div
                key={p.name}
                className={`projections-row${selectedName === p.name ? ' projections-row--active' : ''}`}
                onClick={() => setSelectedName(p.name)}
              >
                <div className="projections-row__name">{p.name}</div>
                <div className="projections-row__time">{fmtAgo(p.lastModified)}</div>
              </div>
            ))
          )}
        </div>
        <div
          className="projections-content"
          onClick={handleBodyClick}
        >
          {content ? (
            <div
              ref={bodyRef}
              className="projections-body"
              onMouseUp={handleMouseUp}
              style={{ position: 'relative' }}
            >
              <Markdown>{content}</Markdown>

              {/* Text-selection marker icon */}
              {markerPos && (
                <button
                  className="proj-marker-btn"
                  style={{ left: markerPos.x, top: markerPos.y }}
                  onClick={handleMarkerClick}
                  aria-label="Add comment"
                  data-testid="proj-marker"
                >
                  &#x2767;
                </button>
              )}

              {/* Action menu */}
              {menuPos && (
                <div
                  ref={menuRef}
                  className="proj-action-menu"
                  style={{ left: menuPos.x, top: menuPos.y }}
                  data-testid="proj-action-menu"
                >
                  <div className="proj-action-menu__actions">
                    {ACTIONS.map((a) => (
                      <button
                        key={a}
                        className={`proj-action-btn${pendingAction === a ? ' proj-action-btn--active' : ''}`}
                        onClick={() => setPendingAction(a)}
                        data-testid={`proj-action-${a}`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                  {pendingAction && (
                    <>
                      <textarea
                        className="proj-action-note"
                        placeholder="optional note…"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        rows={2}
                        data-testid="proj-note-input"
                      />
                      <button
                        className="proj-action-confirm"
                        onClick={handleConfirm}
                        data-testid="proj-confirm"
                      >
                        confirm
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="projections-no-selection">
              {projections.length === 0 ? 'no projections in .sdd/projections/' : 'select a projection'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

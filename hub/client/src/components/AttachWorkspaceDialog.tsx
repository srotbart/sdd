import { useState, useEffect, useRef } from 'react';
import './AttachWorkspaceDialog.css';

interface RecentFolder {
  path: string;
  label: string;
  desc: string;
  hasSdd: boolean;
  sddSummary?: { targets: number; specs: number; items: number; gaps: number };
}


interface AttachWorkspaceDialogProps {
  onClose: () => void;
  onAttached: () => void;
}

export function AttachWorkspaceDialog({ onClose, onAttached }: AttachWorkspaceDialogProps) {
  const [path, setPath] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [nameDirty, setNameDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [recentFolders, setRecentFolders] = useState<RecentFolder[]>([]);
  const [checkedHasSdd, setCheckedHasSdd] = useState<boolean | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/recent-workspaces')
      .then((r) => r.json())
      .then((data: RecentFolder[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setRecentFolders(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const trimmed = path.trim();
    const inRecent = recentFolders.some((r) => r.path.toLowerCase() === trimmed.toLowerCase());
    if (!trimmed || inRecent) {
      setCheckedHasSdd(null);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/check-sdd?path=${encodeURIComponent(trimmed)}`)
        .then((r) => r.json())
        .then((data: { hasSdd: boolean }) => setCheckedHasSdd(data.hasSdd))
        .catch(() => setCheckedHasSdd(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [path, recentFolders]);

  function setPathAndDeriveName(p: string) {
    setPath(p);
    if (!nameDirty) {
      const base = p.replace(/\/$/, '').split('/').pop() ?? '';
      setName(base);
    }
  }

  const matched = recentFolders.find((r) => r.path.toLowerCase() === path.trim().toLowerCase());
  const pathSet = path.trim().length > 0;
  const hasSdd = matched ? matched.hasSdd : checkedHasSdd === true;
  const willInit = pathSet && !hasSdd;

  const primaryLabel = !pathSet ? 'attach workspace' : hasSdd ? 'attach workspace' : 'initialize & attach';
  const disabled = !pathSet || name.trim().length === 0 || submitting;

  async function handleBrowse() {
    setBrowsing(true);
    try {
      const res = await fetch('/browse-folder');
      const data = await res.json() as { path: string | null };
      if (data.path) {
        setPathAndDeriveName(data.path);
        inputRef.current?.focus();
      }
    } finally {
      setBrowsing(false);
    }
  }

  async function handleSubmit() {
    if (disabled) return;
    const trimmed = path.trim();
    setSubmitting(true);
    try {
      await fetch('/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), path: trimmed, description: desc.trim() || null }),
      });
      onAttached();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dlg-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="dlg" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
        <div className="dlg-head">
          <h2 id="dlg-title">Attach workspace</h2>
          <button className="dlg-x" onClick={onClose} aria-label="close">✕</button>
        </div>

        <div className="dlg-body">
          {/* PATH */}
          <div className="dlg-field">
            <label className="dlg-eyebrow">Project location</label>
            <div className="dlg-path-row">
              <input
                ref={inputRef}
                type="text"
                placeholder="~/code/your-project"
                value={path}
                onChange={(e) => setPathAndDeriveName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
              />
              <button className="dlg-browse" onClick={handleBrowse} disabled={browsing} tabIndex={-1}>
                {browsing ? '…' : 'browse…'}
              </button>
            </div>

            {!pathSet && recentFolders.length > 0 && (
              <div className="dlg-suggest">
                <div className="dlg-suggest-label">Recent folders</div>
                {recentFolders.map((r) => (
                  <button key={r.path} className="dlg-suggest-row" onClick={() => setPathAndDeriveName(r.path)}>
                    <span className="dlg-suggest-path">{r.path}</span>
                    <span className="dlg-suggest-desc">{r.desc}</span>
                    <span className={`dlg-suggest-tag dlg-suggest-tag--${r.hasSdd ? 'has' : 'fresh'}`}>
                      <span className="dlg-suggest-dot" />
                      {r.hasSdd ? 'SDD READY' : 'FRESH'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* STATE PREVIEW */}
          {pathSet && (
            <div className={`dlg-preview dlg-preview--${hasSdd ? 'has' : 'fresh'}`}>
              <div className="dlg-preview-head">
                <span className="dlg-preview-dot" style={{ background: hasSdd ? 'var(--st-done)' : 'var(--st-stale)' }} />
                {hasSdd
                  ? <span>Existing <code>.sdd/</code> detected</span>
                  : <span>No <code>.sdd/</code> here yet</span>}
              </div>
              <div className="dlg-preview-body">
                {hasSdd ? (
                  <>
                    The hub will read the existing artifacts.
                    {matched?.sddSummary && (
                      <span className="dlg-preview-stats">
                        <span><b>{matched.sddSummary.targets}</b> targets</span>
                        <span><b>{matched.sddSummary.specs}</b> spec files · <b>{matched.sddSummary.items}</b> items</span>
                        <span><b>{matched.sddSummary.gaps}</b> open gaps</span>
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    Initializing will create the directory structure and a starter target.
                    <span className="dlg-preview-stats">
                      <span className="dlg-muted">.sdd/targets/ · specs/ · gaps/ · work-items/</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* NAME */}
          {pathSet && (
            <div className="dlg-field">
              <label className="dlg-eyebrow">Workspace name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameDirty(true); }}
                placeholder="short identifier shown in the sidebar"
              />
              <div className="dlg-field-hint">Used as the workspace label. Lowercase, no spaces.</div>
            </div>
          )}

          {/* DESCRIPTION */}
          {pathSet && (
            <div className="dlg-field">
              <label className="dlg-eyebrow">
                Description <span className="dlg-opt">optional</span>
              </label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="one line — what is this project?"
              />
            </div>
          )}

          {/* COMMAND PEEK */}
          {willInit && name && (
            <div className="dlg-cmd-peek">
              <span className="dlg-cmd-prompt">$</span>
              <span>
                cd <span className="dlg-cmd-path">{path}</span> &amp;&amp; /sdd:init
                {desc ? ` "${desc}"` : ''}
              </span>
            </div>
          )}
        </div>

        <div className="dlg-foot">
          <span className="dlg-hint">
            <kbd className="dlg-kbd">Esc</kbd> to cancel
          </span>
          <span className="dlg-actions">
            <button className="dlg-cancel" onClick={onClose}>cancel</button>
            <button className="dlg-submit" disabled={disabled} onClick={handleSubmit}>
              {submitting ? 'attaching…' : primaryLabel}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

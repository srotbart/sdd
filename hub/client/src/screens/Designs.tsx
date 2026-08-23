import { useState, useEffect, useMemo } from 'react';
import { Markdown } from '../components/Markdown';
import { useWorkspaceResource } from '../hooks/useWorkspaceResource';
import './Designs.css';
import type { Design } from '../types';

interface DesignsProps {
  workspaceId: string;
  refreshToken?: number;
}

function fmtAgo(dateStr: string): string {
  const sec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (sec < 60) return sec + 's ago';
  if (sec < 3600) return Math.floor(sec / 60) + 'm ago';
  if (sec < 86400) return Math.floor(sec / 3600) + 'h ago';
  return Math.floor(sec / 86400) + 'd ago';
}

export function Designs({ workspaceId, refreshToken }: DesignsProps) {
  const { data } = useWorkspaceResource<Design[]>(workspaceId, 'designs', refreshToken);
  const designs = useMemo(
    () =>
      [...(data ?? [])].sort(
        (a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      ),
    [data]
  );
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    if (designs.length > 0 && !selectedName) {
      setSelectedName(designs[0].name);
    }
  }, [designs, selectedName]);

  useEffect(() => {
    if (!selectedName) { setContent(null); return; }
    fetch(`/workspaces/${workspaceId}/designs/${selectedName}`)
      .then((r) => r.ok ? r.text() : Promise.reject(r.status))
      .then((text) => setContent(text))
      .catch(() => setContent(null));
  }, [workspaceId, selectedName, refreshToken]);

  return (
    <div className="designs-root">
      <div className="designs-layout">
        <div className="designs-sidebar">
          <div className="designs-sidebar__label">designs</div>
          {designs.length === 0 ? (
            <div className="designs-empty">no designs yet</div>
          ) : (
            designs.map((d) => (
              <div
                key={d.name}
                className={`designs-row${selectedName === d.name ? ' designs-row--active' : ''}`}
                onClick={() => setSelectedName(d.name)}
              >
                <div className="designs-row__name">{d.name}</div>
                <div className="designs-row__time">{fmtAgo(d.lastModified)}</div>
              </div>
            ))
          )}
        </div>
        <div className="designs-content">
          {content ? (
            <div className="designs-body">
              <Markdown>{content}</Markdown>
            </div>
          ) : (
            <div className="designs-no-selection">
              {designs.length === 0 ? 'no designs in .sdd/design/' : 'select a design'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

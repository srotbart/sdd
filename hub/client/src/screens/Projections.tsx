import { useState, useEffect } from 'react';
import { Markdown } from '../components/Markdown';
import './Projections.css';
import type { Projection } from '../types';

interface ProjectionsProps {
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

export function Projections({ workspaceId, refreshToken }: ProjectionsProps) {
  const [projections, setProjections] = useState<Projection[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);

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

  useEffect(() => {
    if (!selectedName) { setContent(null); return; }
    fetch(`/workspaces/${workspaceId}/projections/${selectedName}`)
      .then((r) => r.ok ? r.text() : Promise.reject(r.status))
      .then((text) => setContent(text))
      .catch(() => setContent(null));
  }, [workspaceId, selectedName, refreshToken]);

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
        <div className="projections-content">
          {content ? (
            <div className="projections-body">
              <Markdown>{content}</Markdown>
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

import { useState, useEffect } from 'react';
import { Markdown } from '../components/Markdown';
import './Standards.css';

interface StandardsFile {
  name: string;
  content: string;
}

interface StandardsProps {
  workspaceId: string | null;
  /** Bumped on a live `standards` sdd-changed event to force a re-fetch. */
  refreshToken?: number;
}

function parseSections(content: string): Array<{ heading: string; body: string }> {
  const sections: Array<{ heading: string; body: string }> = [];
  const parts = content.split(/\n(?=## )/);
  for (const part of parts) {
    const headingMatch = /^## (.+)/.exec(part.trim());
    if (headingMatch) {
      const heading = headingMatch[1].trim();
      const body = part.replace(/^## .+\n?/, '').trim();
      sections.push({ heading, body });
    } else if (part.trim()) {
      sections.push({ heading: '', body: part.trim() });
    }
  }
  return sections;
}

export function Standards({ workspaceId, refreshToken }: StandardsProps) {
  const [files, setFiles] = useState<StandardsFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!workspaceId) {
      setFiles([]);
      return;
    }
    setLoading(true);
    fetch(`/workspaces/${workspaceId}/standards`)
      .then((r) => r.json())
      .then((data: StandardsFile[]) => {
        setFiles(data);
        setLoading(false);
      })
      .catch(() => {
        setFiles([]);
        setLoading(false);
      });
  }, [workspaceId, refreshToken]);

  if (loading) {
    return <div className="standards-empty">loading…</div>;
  }

  if (files.length === 0) {
    return (
      <div className="standards-layout">
        <div className="standards-title-bar">
          <span className="standards-title-bullet">▪</span>
          <span className="standards-title-word">standards</span>
          <span className="standards-title-sub">— coding conventions and review rubrics</span>
        </div>
        <div className="standards-empty">no standards files found in .sdd/standards/</div>
      </div>
    );
  }

  return (
    <div className="standards-layout">
      <div className="standards-title-bar">
        <span className="standards-title-bullet">▪</span>
        <span className="standards-title-word">standards</span>
        <span className="standards-title-sub">— coding conventions and review rubrics</span>
      </div>
      {files.map((file) => {
        const sections = parseSections(file.content);
        return (
          <div key={file.name}>
            <div className="standards-file-source">{file.name}</div>
            {sections.length > 0 ? (
              sections.map((sec, i) => (
                <div key={i} className="standards-section">
                  {sec.heading && (
                    <h2 className="standards-section__heading">{sec.heading}</h2>
                  )}
                  <div className="standards-section__content"><Markdown>{sec.body}</Markdown></div>
                </div>
              ))
            ) : (
              <div className="standards-content"><Markdown>{file.content}</Markdown></div>
            )}
          </div>
        );
      })}
    </div>
  );
}

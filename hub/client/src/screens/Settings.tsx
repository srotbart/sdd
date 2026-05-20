import { useState, useEffect } from 'react';
import './Settings.css';

interface WorkspaceFields {
  id: string;
  name: string;
  path: string;
  description: string;
}

interface SettingsProps {
  workspaceId: string;
}

async function patchField(id: string, field: string, value: string): Promise<void> {
  await fetch(`/workspaces/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ [field]: value }),
  });
}

export function Settings({ workspaceId }: SettingsProps) {
  const [fields, setFields] = useState<WorkspaceFields | null>(null);
  const [draft, setDraft] = useState<Omit<WorkspaceFields, 'id'> | null>(null);

  useEffect(() => {
    fetch('/workspaces')
      .then((r) => r.json())
      .then((all: WorkspaceFields[]) => {
        const ws = all.find((w) => w.id === workspaceId);
        if (ws) {
          setFields(ws);
          setDraft({ name: ws.name, path: ws.path, description: ws.description });
        }
      })
      .catch(() => {});
  }, [workspaceId]);

  function handleBlur(field: keyof Omit<WorkspaceFields, 'id'>) {
    if (!fields || !draft) return;
    const value = draft[field];
    if (value === fields[field]) return;
    patchField(fields.id, field, value).then(() => {
      setFields((f) => (f ? { ...f, [field]: value } : f));
    }).catch(() => {});
  }

  if (!fields || !draft) {
    return (
      <div className="settings">
        <div className="settings-title-row">
          <span className="settings-bullet">○</span>
          <h1 className="settings-title">workspace settings</h1>
        </div>
        <div className="settings-title-rule" />
        <p style={{ padding: '24px', color: 'var(--ink-3)', fontFamily: 'Geist, sans-serif', fontSize: 13 }}>
          Loading…
        </p>
      </div>
    );
  }

  const sddLocation = `${draft.path}/.sdd`;

  return (
    <div className="settings">
      <div className="settings-title-row">
        <span className="settings-bullet">○</span>
        <h1 className="settings-title">workspace settings</h1>
      </div>
      <div className="settings-title-rule" />

      <div className="settings-section">
        <div className="settings-eyebrow">workspace</div>
        <div className="settings-card">
          <div className="settings-field">
            <label className="settings-label">name</label>
            <input
              className="settings-input"
              value={draft.name}
              onChange={(e) => setDraft((d) => d ? { ...d, name: e.target.value } : d)}
              onBlur={() => handleBlur('name')}
            />
          </div>
          <div className="settings-rule" />
          <div className="settings-field">
            <label className="settings-label">path</label>
            <input
              className="settings-input"
              value={draft.path}
              onChange={(e) => setDraft((d) => d ? { ...d, path: e.target.value } : d)}
              onBlur={() => handleBlur('path')}
            />
          </div>
          <div className="settings-rule" />
          <div className="settings-field">
            <label className="settings-label">description</label>
            <input
              className="settings-input"
              value={draft.description}
              onChange={(e) => setDraft((d) => d ? { ...d, description: e.target.value } : d)}
              onBlur={() => handleBlur('description')}
            />
          </div>
          <div className="settings-rule" />
          <div className="settings-field">
            <label className="settings-label">.sdd location</label>
            <span className="settings-computed">{sddLocation}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

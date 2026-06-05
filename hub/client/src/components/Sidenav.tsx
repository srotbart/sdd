import { useState, useEffect, useRef } from 'react';
import './Sidenav.css';
import { AttachWorkspaceDialog } from './AttachWorkspaceDialog';

export interface Workspace {
  id: string;
  name: string;
  path: string;
  alertCount?: number;
}

const NAV_TABS = ['session', 'targets', 'specs', 'projections', 'designs', 'gaps', 'work items', 'issues', 'improvements', 'standards', 'activity', 'settings'] as const;

interface SidenavProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onSelectWorkspace: (id: string) => void;
  onSelectHub: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  tabCounts?: Partial<Record<string, number>>;
  isHubActive: boolean;
  isConnected?: boolean;
  onWorkspaceAttached?: () => void;
  onSelectPluginRef?: () => void;
  pluginRefActive?: boolean;
}

export function Sidenav({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onSelectHub,
  onSelectPluginRef,
  pluginRefActive,
  activeTab,
  onSelectTab,
  tabCounts = {},
  isHubActive,
  isConnected = false,
  onWorkspaceAttached,
}: SidenavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeWorkspace = workspaces.find((ws) => ws.id === activeWorkspaceId) ?? null;

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  function openDialog() {
    setDropdownOpen(false);
    setDialogOpen(true);
  }

  function handleSelect(id: string) {
    onSelectWorkspace(id);
    setDropdownOpen(false);
  }

  return (
    <>
      <nav className="sidenav">
        <div className="sidenav-scroll">
          <button
            className={`sidenav-hub-row${isHubActive ? ' sidenav-hub-row--active' : ''}`}
            onClick={onSelectHub}
          >
            <span className={`sidenav-dot${isConnected ? ' sidenav-dot--active' : ' sidenav-dot--idle'}`} />
            <span className="sidenav-hub-label">hub overview</span>
          </button>

          <div className="sidenav-section">
            <div className="sidenav-eyebrow">
              <span>workspace</span>
              <span className="sidenav-eyebrow-count">{workspaces.length}</span>
              <button className="sidenav-add" title="Attach workspace" onClick={openDialog}>+</button>
            </div>

            <div className="sidenav-ws-dropdown-wrap" ref={dropdownRef}>
              <button
                className={`sidenav-ws-trigger${activeWorkspaceId ? ' sidenav-ws-trigger--active' : ''}${dropdownOpen ? ' sidenav-ws-trigger--open' : ''}`}
                onClick={() => setDropdownOpen((o) => !o)}
              >
                <span className={`sidenav-dot${activeWorkspace ? ' sidenav-dot--active' : ' sidenav-dot--idle'}`} />
                <span className="sidenav-ws-name">
                  {activeWorkspace ? activeWorkspace.name : 'select workspace'}
                </span>
                {activeWorkspace?.alertCount ? (
                  <span className="sidenav-badge">{activeWorkspace.alertCount}!</span>
                ) : null}
                <span className="sidenav-chevron">{dropdownOpen ? '▾' : '▴'}</span>
              </button>

              {dropdownOpen && (
                <div className="sidenav-ws-panel">
                  {workspaces.map((ws) => {
                    const active = ws.id === activeWorkspaceId;
                    return (
                      <button
                        key={ws.id}
                        className={`sidenav-ws-panel-row${active ? ' sidenav-ws-panel-row--active' : ''}`}
                        onClick={() => handleSelect(ws.id)}
                      >
                        <span className={`sidenav-dot${active ? ' sidenav-dot--active' : ' sidenav-dot--idle'}`} />
                        <span className="sidenav-ws-panel-info">
                          <span className="sidenav-ws-panel-name">{ws.name}</span>
                          <span className="sidenav-ws-panel-path">{ws.path}</span>
                        </span>
                        {!!ws.alertCount && (
                          <span className="sidenav-badge">{ws.alertCount}!</span>
                        )}
                      </button>
                    );
                  })}
                  <button className="sidenav-ws-attach-row" onClick={openDialog}>
                    <span className="sidenav-ws-attach-label">+ attach workspace</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {activeWorkspaceId && (
            <div className="sidenav-section">
              <div className="sidenav-eyebrow">
                <span>navigate</span>
              </div>
              {NAV_TABS.map((tab) => {
                const active = tab === activeTab;
                const count = tabCounts[tab];
                return (
                  <button
                    key={tab}
                    className={`sidenav-nav-row${active ? ' sidenav-nav-row--active' : ''}`}
                    onClick={() => onSelectTab(tab)}
                  >
                    <span className="sidenav-nav-label">{tab}</span>
                    {count !== undefined && count > 0 && (
                      <span className="sidenav-nav-count">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="sidenav-plugin-ref-section">
          <button
            className={`sidenav-plugin-ref-row${pluginRefActive ? ' sidenav-plugin-ref-row--active' : ''}`}
            onClick={onSelectPluginRef}
          >
            <span className="sidenav-plugin-ref-glyph">❡</span>
            <span className="sidenav-plugin-ref-label">plugin reference</span>
          </button>
        </div>
      </nav>

      {dialogOpen && (
        <AttachWorkspaceDialog
          onClose={() => setDialogOpen(false)}
          onAttached={() => {
            setDialogOpen(false);
            onWorkspaceAttached?.();
          }}
        />
      )}
    </>
  );
}

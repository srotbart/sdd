import { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import 'xterm/css/xterm.css';
import './TerminalPanel.css';

const WS_PORT = 22351;

interface TerminalPanelProps {
  workspacePath?: string;
  onClose: () => void;
}

export function TerminalPanel({ workspacePath, onClose }: TerminalPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) { return; }

    // Initialise xterm
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'Menlo, Consolas, monospace',
      theme: {
        background: '#1a1a1a',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
      },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(container);
    fit.fit();

    termRef.current = term;
    fitRef.current = fit;

    // Connect WebSocket to the PTY endpoint
    const cwdParam = workspacePath ? encodeURIComponent(workspacePath) : '';
    const wsUrl = `ws://127.0.0.1:${WS_PORT}/terminal${cwdParam ? `?cwd=${cwdParam}` : ''}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      term.write(event.data as string);
    };

    ws.onclose = () => {
      term.write('\r\n[connection closed]\r\n');
    };

    // Forward keyboard input to the PTY
    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Propagate size changes to the PTY via resize messages
    const sendResize = () => {
      try {
        fit.fit();
        const { cols, rows } = term;
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'resize', cols, rows }));
        }
      } catch {
        // ignore if fit throws (e.g. container not yet visible)
      }
    };

    const ro = new ResizeObserver(sendResize);
    ro.observe(container);
    resizeObserverRef.current = ro;

    return () => {
      ro.disconnect();
      ws.close();
      term.dispose();
      termRef.current = null;
      fitRef.current = null;
      wsRef.current = null;
      resizeObserverRef.current = null;
    };
  }, [workspacePath]);

  return (
    <div className="term-panel" data-testid="terminal-panel">
      <div className="term-panel__header">
        <span className="term-panel__title">terminal</span>
        <button
          className="term-panel__close"
          onClick={onClose}
          aria-label="Close terminal"
          data-testid="terminal-close"
        >
          ×
        </button>
      </div>
      <div
        ref={containerRef}
        className="term-panel__body"
        data-testid="terminal-body"
      />
    </div>
  );
}

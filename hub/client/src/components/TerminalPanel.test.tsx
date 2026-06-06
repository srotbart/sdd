import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor, fireEvent } from '@testing-library/react';

// ---- Mock xterm and fit addon ----
// xterm requires a real canvas context that jsdom cannot provide.
// We mock the modules before importing the component.

interface MockTerminal {
  loadAddon: ReturnType<typeof vi.fn>;
  open: ReturnType<typeof vi.fn>;
  write: ReturnType<typeof vi.fn>;
  onData: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
  cols: number;
  rows: number;
  _dataListener?: (data: string) => void;
}

let lastTerm: MockTerminal;

vi.mock('xterm', () => {
  function TerminalMock() {
    const term: MockTerminal = {
      loadAddon: vi.fn(),
      open: vi.fn(),
      write: vi.fn(),
      onData: vi.fn(function (this: void, cb: (data: string) => void) { term._dataListener = cb; }),
      dispose: vi.fn(),
      cols: 80,
      rows: 24,
    };
    lastTerm = term;
    return term;
  }
  return { Terminal: TerminalMock };
});

vi.mock('@xterm/addon-fit', () => {
  function FitAddonMock() {
    return { fit: vi.fn() };
  }
  return { FitAddon: FitAddonMock };
});

vi.mock('xterm/css/xterm.css', () => ({}));

// ---- Mock WebSocket ----
interface MockWs {
  onmessage: ((event: { data: string }) => void) | null;
  onclose: (() => void) | null;
  readyState: number;
  send: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
  /** Helper: simulate a message from the server */
  deliver: (data: string) => void;
  /** Helper: simulate server closing the connection */
  serverClose: () => void;
}

let lastWs: MockWs;
let wsConstructorCalls: string[] = [];

function MockWebSocket(url: string) {
  wsConstructorCalls.push(url);
  const ws: MockWs = {
    onmessage: null,
    onclose: null,
    readyState: 1, // OPEN = 1
    send: vi.fn(),
    close: vi.fn(),
    deliver(data) { this.onmessage?.({ data }); },
    serverClose() { this.onclose?.(); },
  };
  lastWs = ws;
  return ws;
}
// Expose static constants that the component checks (ws.readyState === WebSocket.OPEN)
MockWebSocket.OPEN = 1;
MockWebSocket.CONNECTING = 0;
MockWebSocket.CLOSING = 2;
MockWebSocket.CLOSED = 3;

vi.stubGlobal('WebSocket', MockWebSocket);

// Also stub ResizeObserver which jsdom doesn't provide
function MockResizeObserver(_cb: ResizeObserverCallback) {
  return { observe: vi.fn(), disconnect: vi.fn() };
}
vi.stubGlobal('ResizeObserver', MockResizeObserver);

// ---- Import component after mocks are in place ----
const { TerminalPanel } = await import('./TerminalPanel');

beforeEach(() => {
  vi.clearAllMocks();
  wsConstructorCalls = [];
});

describe('TerminalPanel — floating terminal (SPEC-ui-022)', () => {
  it('renders the terminal panel container and close button', () => {
    render(<TerminalPanel onClose={vi.fn()} />);

    expect(document.querySelector('[data-testid="terminal-panel"]')).not.toBeNull();
    expect(document.querySelector('[data-testid="terminal-close"]')).not.toBeNull();
  });

  it('opens a WebSocket to the PTY endpoint on mount', async () => {
    wsConstructorCalls = [];
    render(<TerminalPanel onClose={vi.fn()} />);

    await waitFor(() => expect(wsConstructorCalls.length).toBeGreaterThan(0));
    expect(wsConstructorCalls[0]).toMatch(/\/terminal/);
  });

  it('includes the workspacePath as cwd in the WebSocket URL', async () => {
    wsConstructorCalls = [];
    render(<TerminalPanel workspacePath="/home/user/my-project" onClose={vi.fn()} />);

    await waitFor(() => expect(wsConstructorCalls.length).toBeGreaterThan(0));
    expect(wsConstructorCalls[0]).toMatch(/cwd=/);
    expect(wsConstructorCalls[0]).toMatch(/my-project/);
  });

  it('writes incoming WebSocket messages to the terminal', async () => {
    render(<TerminalPanel onClose={vi.fn()} />);
    await waitFor(() => expect(lastTerm).toBeDefined());

    lastWs.deliver('$ ls\r\n');

    expect(lastTerm.write).toHaveBeenCalledWith('$ ls\r\n');
  });

  it('forwards terminal key input to the WebSocket', async () => {
    render(<TerminalPanel onClose={vi.fn()} />);
    await waitFor(() => expect(lastTerm).toBeDefined());

    // Simulate user typing in xterm — onData callback is stored by mock
    lastTerm._dataListener?.('h');

    expect(lastWs.send).toHaveBeenCalledWith('h');
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();
    render(<TerminalPanel onClose={onClose} />);

    fireEvent.click(document.querySelector('[data-testid="terminal-close"]') as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disposes the terminal and closes the WebSocket on unmount', async () => {
    const { unmount } = render(<TerminalPanel onClose={vi.fn()} />);
    await waitFor(() => expect(lastTerm).toBeDefined());

    unmount();

    expect(lastTerm.dispose).toHaveBeenCalled();
    expect(lastWs.close).toHaveBeenCalled();
  });

  it('opens an xterm Terminal instance and calls open() on the container element', async () => {
    render(<TerminalPanel onClose={vi.fn()} />);
    await waitFor(() => expect(lastTerm).toBeDefined());

    // open() must be called with the DOM container element
    expect(lastTerm.open).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});

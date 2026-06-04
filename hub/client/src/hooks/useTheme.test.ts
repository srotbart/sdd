import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

// ---------------------------------------------------------------------------
// SPEC-ui-019 — theme mode hook: persistence, data-theme attribute, system mode
// ---------------------------------------------------------------------------

function mockMatchMedia(prefersDark: boolean): ReturnType<typeof vi.fn> {
  const listeners: Array<(e: { matches: boolean }) => void> = [];
  const mq = {
    matches: prefersDark,
    addEventListener: vi.fn((_: string, fn: (e: { matches: boolean }) => void) => {
      listeners.push(fn);
    }),
    removeEventListener: vi.fn((_: string, fn: (e: { matches: boolean }) => void) => {
      const idx = listeners.indexOf(fn);
      if (idx !== -1) { listeners.splice(idx, 1); }
    }),
    // helper to fire a change event in tests
    _fire: (matches: boolean) => { listeners.forEach((fn) => fn({ matches })); },
  };
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn(() => mq),
  });
  return mq as unknown as ReturnType<typeof vi.fn>;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  // default: light preference
  mockMatchMedia(false);
});

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  vi.restoreAllMocks();
});

describe('SPEC-ui-019 — useTheme sets data-theme for each mode', () => {
  it('SPEC-ui-019: light mode removes data-theme attribute', () => {
    localStorage.setItem('hub.themeMode', 'light');
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('SPEC-ui-019: dark mode sets data-theme="dark"', () => {
    localStorage.setItem('hub.themeMode', 'dark');
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('SPEC-ui-019: system mode with dark OS preference sets data-theme="dark"', () => {
    mockMatchMedia(true);
    localStorage.setItem('hub.themeMode', 'system');
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('SPEC-ui-019: system mode with light OS preference removes data-theme', () => {
    mockMatchMedia(false);
    localStorage.setItem('hub.themeMode', 'system');
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });
});

describe('SPEC-ui-019 — useTheme reads persisted mode from localStorage on mount', () => {
  it('SPEC-ui-019: defaults to system mode when no key is stored', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.mode).toBe('system');
  });

  it('SPEC-ui-019: restores stored dark mode on mount', () => {
    localStorage.setItem('hub.themeMode', 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.mode).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('SPEC-ui-019: restores stored light mode on mount', () => {
    localStorage.setItem('hub.themeMode', 'light');
    const { result } = renderHook(() => useTheme());
    expect(result.current.mode).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('SPEC-ui-019: setMode writes to localStorage', () => {
    const { result } = renderHook(() => useTheme());
    act(() => { result.current.setMode('dark'); });
    expect(localStorage.getItem('hub.themeMode')).toBe('dark');
  });
});

describe('SPEC-ui-019 — useTheme system mode responds to matchMedia change event', () => {
  it('SPEC-ui-019: switching OS to dark while in system mode applies data-theme="dark"', () => {
    const mq = mockMatchMedia(false) as unknown as {
      matches: boolean;
      _fire: (matches: boolean) => void;
      addEventListener: ReturnType<typeof vi.fn>;
      removeEventListener: ReturnType<typeof vi.fn>;
    };
    localStorage.setItem('hub.themeMode', 'system');
    renderHook(() => useTheme());
    // initially light
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    // OS switches to dark
    act(() => { mq._fire(true); });
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('SPEC-ui-019: switching OS to light while in system mode removes data-theme', () => {
    const mq = mockMatchMedia(true) as unknown as {
      matches: boolean;
      _fire: (matches: boolean) => void;
      addEventListener: ReturnType<typeof vi.fn>;
      removeEventListener: ReturnType<typeof vi.fn>;
    };
    localStorage.setItem('hub.themeMode', 'system');
    renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    act(() => { mq._fire(false); });
    expect(document.documentElement.getAttribute('data-theme')).toBeNull();
  });

  it('SPEC-ui-019: non-system mode does not attach a matchMedia listener', () => {
    const mq = mockMatchMedia(false) as unknown as {
      addEventListener: ReturnType<typeof vi.fn>;
    };
    localStorage.setItem('hub.themeMode', 'dark');
    renderHook(() => useTheme());
    expect((mq.addEventListener as ReturnType<typeof vi.fn>).mock.calls.length).toBe(0);
  });

  it('SPEC-ui-019: listener is removed when hook unmounts in system mode', () => {
    const mq = mockMatchMedia(false) as unknown as {
      removeEventListener: ReturnType<typeof vi.fn>;
    };
    localStorage.setItem('hub.themeMode', 'system');
    const { unmount } = renderHook(() => useTheme());
    unmount();
    expect((mq.removeEventListener as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
  });
});

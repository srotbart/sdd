import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'hub.themeMode';

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

function applyTheme(resolved: 'light' | 'dark'): void {
  if (resolved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function readStoredMode(): ThemeMode {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw === 'light' || raw === 'dark' || raw === 'system') { return raw; }
  return 'system';
}

export function useTheme(): { mode: ThemeMode; setMode: (mode: ThemeMode) => void } {
  const [mode, setModeState] = useState<ThemeMode>(readStoredMode);

  // Apply theme and set up system listener whenever mode changes
  useEffect(() => {
    const resolved = resolveTheme(mode);
    applyTheme(resolved);

    if (mode !== 'system') { return; }

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    function onSystemChange(e: MediaQueryListEvent | { matches: boolean }) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
    mq.addEventListener('change', onSystemChange as (e: MediaQueryListEvent) => void);
    return () => mq.removeEventListener('change', onSystemChange as (e: MediaQueryListEvent) => void);
  }, [mode]);

  function setMode(next: ThemeMode) {
    localStorage.setItem(STORAGE_KEY, next);
    setModeState(next);
  }

  return { mode, setMode };
}

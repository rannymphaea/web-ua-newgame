'use client';
// ── NEWGAME Theme Engine ──────────────────────────────────────────────────────
// System-preference-first dark mode. 350ms morph. Zero FOUC.
// Usage: import { useTheme } from '@/lib/theme-engine';

import { useEffect, useState, useCallback } from 'react';

const THEME_KEY = 'ng-theme';
export type Theme = 'light' | 'dark';

/** Call once — reads system pref + localStorage, applies class before paint */
export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/** Inline script string — injected in <head> to set class before first paint */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('ng-theme');var d=(t==='dark')||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    setThemeState(getInitialTheme());
  }, []);

  const setTheme = useCallback((t: Theme) => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try { localStorage.setItem(THEME_KEY, t); } catch {}
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
}

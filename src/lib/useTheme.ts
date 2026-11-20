import { useEffect, useSyncExternalStore } from 'react';
import {
  parseThemePreference,
  resolveTheme,
  THEME_COLOR,
  THEME_STORAGE_KEY,
  type Theme,
  type ThemePreference
} from '../shared/theme';

const CHANGE_EVENT = 'themepreferencechange';
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

const readPreference = (): ThemePreference => {
  try {
    return parseThemePreference(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return 'system';
  }
};

// Same DOM changes as the startup script in index.html.
const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', THEME_COLOR[theme]);
};

const applyPreference = (preference: ThemePreference) =>
  applyTheme(resolveTheme(preference, darkQuery().matches));

export const setThemePreference = (preference: ThemePreference) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Storage can be unavailable (private mode); still apply for this visit.
  }
  applyPreference(preference);
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange); // other tabs
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
};

// Current preference for the theme control.
export const useThemePreference = () =>
  useSyncExternalStore(subscribe, readPreference, () => 'system' as const);

// Mounted once in the root layout: follows OS theme changes while the
// preference is "system", and applies changes made in another tab.
export const useThemeSync = () => {
  const preference = useThemePreference();

  useEffect(() => {
    applyPreference(preference);
    if (preference !== 'system') return;

    const query = darkQuery();
    const onChange = () => applyPreference('system');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [preference]);
};

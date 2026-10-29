// Theme preference rules. The inline script in index.html applies the same
// rules before React loads (to avoid a flash of the wrong theme); keep the two
// in sync.

export type ThemePreference = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';

// Browser UI color (status bar / address bar) per theme: the header surface.
export const THEME_COLOR: Record<Theme, string> = {
  light: '#ffffff',
  dark: '#0f172a'
};

export const parseThemePreference = (value: string | null): ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system'
    ? value
    : 'system';

export const resolveTheme = (
  preference: ThemePreference,
  systemPrefersDark: boolean
): Theme =>
  preference === 'system'
    ? systemPrefersDark
      ? 'dark'
      : 'light'
    : preference;

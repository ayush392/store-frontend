import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { FiLogOut, FiMonitor, FiMoon, FiSun, FiUser } from 'react-icons/fi';
import { fetcher } from '../lib/fetcher';
import { setThemePreference, useThemePreference } from '../lib/useTheme';
import { formatEnum } from '../shared/format';
import { queryKeys } from '../shared/queryKeys';
import type { Me } from '../shared/types';
import type { ThemePreference } from '../shared/theme';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: me } = useQuery({
    queryKey: queryKeys.me(),
    queryFn: () => fetcher<Me>('/auth/me'),
    staleTime: 60 * 60 * 1000
  });
  const initial = me?.name.trim().charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <Link to="/" className="flex min-h-11 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-on-primary">DB</span>
          </div>
          <span className="text-lg font-semibold text-fg">Dukaan Book</span>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={me ? `Account menu for ${me.name}` : 'Account menu'}
          aria-haspopup="dialog"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-base font-semibold text-primary"
        >
          {initial || <FiUser size={20} aria-hidden="true" />}
        </button>
      </header>

      {/* Rendered beside the header, not inside it: the header creates its own
          stacking context (z-30) and would trap the sheet below the add button. */}
      {menuOpen && (
        <BottomSheet title="Account" onClose={() => setMenuOpen(false)}>
          <AccountMenu me={me} />
        </BottomSheet>
      )}
    </>
  );
};

const AccountMenu = ({ me }: { me: Me | undefined }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Logging out only clears this device: the token is removed, but the server
  // has no logout endpoint, so the token stays valid there until it expires.
  const logout = async () => {
    localStorage.removeItem('token');
    await navigate({ to: '/login', replace: true });
    queryClient.clear(); // no cached data from this user stays in memory
  };

  return (
    <div className="space-y-4">
      {me ? (
        <div>
          <p className="text-lg font-semibold text-fg">{me.name}</p>
          <p className="text-sm text-fg-secondary">
            {formatEnum(me.role)} · {me.phone}
          </p>
        </div>
      ) : (
        <p className="text-sm text-fg-secondary">
          Couldn't load your profile.
        </p>
      )}

      <ThemeControl />

      <Button variant="secondary" fullWidth onClick={logout}>
        <FiLogOut size={18} aria-hidden="true" />
        Log out
      </Button>
    </div>
  );
};

const themeOptions: Array<{
  value: ThemePreference;
  label: string;
  icon: typeof FiMonitor;
}> = [
  { value: 'system', label: 'System', icon: FiMonitor },
  { value: 'light', label: 'Light', icon: FiSun },
  { value: 'dark', label: 'Dark', icon: FiMoon }
];

const ThemeControl = () => {
  const preference = useThemePreference();

  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-fg-secondary">
        Theme
      </legend>
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-surface-muted p-1">
        {themeOptions.map(({ value, label, icon: Icon }) => (
          <label
            key={value}
            className={`flex h-11 cursor-pointer items-center justify-center gap-1.5 rounded-md text-sm font-medium has-focus-visible:outline-2 has-focus-visible:outline-focus ${
              preference === value
                ? 'bg-surface text-fg shadow-sm'
                : 'text-fg-secondary active:bg-line'
            }`}
          >
            <input
              type="radio"
              name="theme"
              value={value}
              checked={preference === value}
              onChange={() => setThemePreference(value)}
              className="sr-only"
            />
            <Icon size={16} aria-hidden="true" />
            {label}
          </label>
        ))}
      </div>
    </fieldset>
  );
};

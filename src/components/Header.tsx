import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { fetcher } from '../lib/fetcher';
import { formatEnum } from '../shared/format';
import { queryKeys } from '../shared/queryKeys';
import type { Me } from '../shared/types';
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

      <Button variant="secondary" fullWidth onClick={logout}>
        <FiLogOut size={18} aria-hidden="true" />
        Log out
      </Button>
    </div>
  );
};

import { Link } from '@tanstack/react-router';
import {
  CustomerIcon,
  HomeIcon,
  StaffIcon,
  StoreIcon
} from '../shared/icons';

const navItems = [
  { path: '/', icon: HomeIcon, label: 'Home' },
  { path: '/staffs', icon: StaffIcon, label: 'Staff' },
  { path: '/customers', icon: CustomerIcon, label: 'Customer' },
  { path: '/stores', icon: StoreIcon, label: 'Store' }
] as const;

const itemClass =
  'flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center rounded-lg px-1 py-1.5';

export const FooterNav = () => {
  return (
    <footer className="sticky bottom-0 z-30 border-t border-line bg-surface px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <nav aria-label="Main" className="flex justify-around gap-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            preload="intent"
            // Home is "/", which would otherwise match every page.
            activeOptions={{ exact: path === '/' }}
            activeProps={{
              className: `${itemClass} bg-primary-soft text-primary`
            }}
            inactiveProps={{
              className: `${itemClass} text-fg-secondary active:bg-surface-muted`
            }}
          >
            <Icon size={22} aria-hidden="true" />
            <span className="mt-1 truncate text-xs font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </footer>
  );
};

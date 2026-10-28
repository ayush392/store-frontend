import { Link, useRouterState } from '@tanstack/react-router';
import { CustomerIcon, HomeIcon, RecycleIcon, StaffIcon, StoreIcon } from '../shared/icons';
import { haptics } from '../shared/utils/haptics';

const navItems = [
  { path: '/', icon: HomeIcon, label: 'Home' },
  { path: '/staffs', icon: StaffIcon, label: 'Staff' },
  { path: '/customers', icon: CustomerIcon, label: 'Customers' },
  { path: '/stores', icon: StoreIcon, label: 'Stores' },
  { path: '/recycle', icon: RecycleIcon, label: 'Recycle' }
];

/** Bottom tab bar. Re-tapping the active tab scrolls to top, like native apps. */
export const FooterNav = () => {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  return (
    <footer
      className="app-bar fixed right-0 bottom-0 left-0 z-40 border-t pb-[max(0.375rem,env(safe-area-inset-bottom,0px))]"
      style={{ viewTransitionName: 'tab-bar' }}
    >
      <nav aria-label="Main" className="mx-auto flex h-14 max-w-lg items-stretch px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = path === '/' ? currentPath === '/' : currentPath.startsWith(path);
          const isTabRoot = currentPath === path;

          return (
            <Link
              key={path}
              to={path}
              aria-current={isActive ? 'page' : undefined}
              onClick={(e) => {
                haptics.selection();
                if (isTabRoot) {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="group flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 select-none"
            >
              <span
                className={`flex h-7 w-14 items-center justify-center rounded-full transition-all duration-200 group-active:scale-90 ${
                  isActive ? 'bg-blue-600/10 text-blue-600' : 'text-slate-500'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span
                className={`truncate text-[11px] tracking-tight transition-colors ${
                  isActive ? 'font-semibold text-blue-600' : 'font-medium text-slate-500'
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
};

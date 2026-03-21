import { Link } from '@tanstack/react-router';
import {
  CustomerIcon,
  HomeIcon,
  RecycleIcon,
  StaffIcon,
  StoreIcon
} from '../shared/icons';

const navItems = [
  { path: '/', icon: HomeIcon, label: 'Home' },
  { path: '/staffs', icon: StaffIcon, label: 'Staff' },
  { path: '/customers', icon: CustomerIcon, label: 'Customer' },
  { path: '/stores', icon: StoreIcon, label: 'Store' },
  { path: '/recycle', icon: RecycleIcon, label: 'Recycle' }
];

export const FooterNav = () => {
  return (
    <footer className="sticky bottom-0 z-50 bg-white border-t border-gray-200 px-2 py-2">
      <nav className="flex justify-around">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            preload="intent"
            activeProps={{
              className:
                'flex flex-col items-center py-2 px-1 rounded-lg min-w-0 flex-1 text-blue-600 bg-blue-50'
            }}
            inactiveProps={{
              className:
                'flex flex-col items-center py-2 px-1 rounded-lg min-w-0 flex-1 text-gray-600'
            }}
          >
            <Icon size={20} />
            <span className="text-xs mt-1 font-medium truncate">{label}</span>
          </Link>
        ))}
      </nav>
    </footer>
  );
};

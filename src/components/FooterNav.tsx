import { Link } from '@tanstack/react-router';
import {
  FiHome,
  FiTrash2,
  FiTruck,
  FiUserCheck,
  FiUsers
} from 'react-icons/fi';

const navItems = [
  { path: '/', icon: FiHome, label: 'Home' },
  { path: '/staffs', icon: FiUsers, label: 'Staff' },
  { path: '/customers', icon: FiUserCheck, label: 'Customer' },
  { path: '/stores', icon: FiTruck, label: 'Store' },
  { path: '/recycle', icon: FiTrash2, label: 'Recycle' }
];

export const FooterNav = () => {
  return (
    <footer className="sticky bottom-0 z-50 bg-white border-t border-gray-200 px-2 py-2">
      <div className="flex justify-around">
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
      </div>
    </footer>
  );
};

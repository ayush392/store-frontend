import { Link } from '@tanstack/react-router';
import { FiBell, FiUser } from 'react-icons/fi';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">DB</span>
        </div>
        <h1 className="text-lg font-semibold text-gray-900">Dukaan Book</h1>
      </Link>

      <div className="flex items-center space-x-3">
        <button className="p-2 text-gray-600 cursor-pointer">
          <FiBell size={20} />
        </button>

        <div className="flex items-center space-x-2 cursor-pointer rounded-lg px-2 py-1">
          <Link
            to="/"
            className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center"
          >
            <FiUser size={16} className="text-gray-600" />
          </Link>

          <div className="hidden sm:block">
            <div className="text-sm font-medium text-gray-900">Admin User</div>
            <div className="text-xs text-gray-500">admin@dukaan.com</div>
          </div>
        </div>
      </div>
    </header>
  );
};

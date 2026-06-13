import { FiEdit3, FiUser } from 'react-icons/fi';
import { formatAmount, formatDate } from '../shared/format';
import type { Account, Employment } from '../shared/types';
import { Link } from '@tanstack/react-router';

type Props = {
  profile: Account;
  employment?: Employment[] | undefined;
};

export const ProfileCard = ({ profile, employment }: Props) => {
  const getEditAccountPageLink = () => {
    switch (profile.accountType) {
      case 'STAFF':
        return {
          to: '/staffs/$staffId/edit',
          params: { staffId: profile._id }
        };
      case 'CUSTOMER':
        return {
          to: '/customers/$customerId/edit',
          params: { customerId: profile._id }
        };
      case 'STORE':
        return {
          to: '/stores/$storeId/edit',
          params: { storeId: profile._id }
        };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            <FiUser size={20} className="text-gray-600" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {profile.name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {profile.displayName}
            </p>
          </div>
        </div>

        <Link className="p-2 text-blue-600" {...getEditAccountPageLink()}>
          <FiEdit3 size={18} />
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span className="text-gray-500">Phone</span>
          <span className="font-medium text-gray-800">{profile.phone}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Address</span>
          <span className="font-medium text-gray-800 text-right">
            {profile.address}
          </span>
        </div>

        {profile.notes && (
          <div className="flex justify-between">
            <span className="text-gray-500">Notes</span>
            <span className="font-medium text-gray-800 text-right truncate">
              {profile.notes}
            </span>
          </div>
        )}

        <div className="flex justify-between text-red-600 ">
          <span className="">Outstanding</span>
          <span className="font-medium">
            {formatAmount(profile.currentOutstanding)}
          </span>
        </div>

        {employment && employment[0] && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-500">Salary</span>
              <span className="font-medium text-gray-800">
                {formatAmount(employment[0].salary)}/
                {employment[0].salaryType === 'DAILY' ? 'day' : 'month'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Joining Date</span>
              <span className="font-medium text-gray-800">
                {formatDate(employment[0].joinDate)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

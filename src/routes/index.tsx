import type { TransactionType } from '@store/schemas';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import WeeklyOverview from '../components/WeeklyOverview';
import { fetcher } from '../lib/fetcher';
import { formatAmount, formatEnum } from '../shared/format';
import { CustomerIcon, StaffIcon, StoreIcon } from '../shared/icons';
import type { RecentTrans } from '../shared/types';

export const Route = createFileRoute('/')({
  component: HomePage
});

const actions = [
  { key: 'customers', label: 'Add Customer', icon: CustomerIcon },
  { key: 'staffs', label: 'Add Staff', icon: StaffIcon },
  { key: 'stores', label: 'Add Store', icon: StoreIcon }
  // { key: 'transactions', label: 'Add Transaction', icon: FiDollarSign }
] as const;

function HomePage() {
  const [filter, setFilter] = useState('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['recent'],
    queryFn: () => fetcher<RecentTrans[]>('/transaction/recent'),
    staleTime: 5 * 60 * 1000
  });

  const getAmountColor = (type: TransactionType) => {
    if (type === 'UDHAAR' || type === 'ADVANCE') {
      return 'text-red-500';
    } else if (type === 'PAYMENT') {
      return 'text-blue-600';
    }
    return 'text-gray-600';
  };

  const getNavigationLink = (trans: RecentTrans) => {
    const { accountType, _id } = trans.account;
    const type = accountType.toLowerCase() + 's';
    return `/${type}/${_id}`;
  };

  if (isLoading) return <div>Loading</div>;
  if (error) {
    console.log(error);
    return <div>{error.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ key, label, icon: Icon }) => (
          <Link
            key={key}
            to={`/${key}/new`}
            className="bg-white text-gray-700 p-4 rounded-lg flex items-center space-x-3 shadow-sm border border-gray-200 cursor-pointer"
          >
            <Icon size={20} className="text-blue-600" />
            <span className="font-medium">{label}</span>
          </Link>
        ))}
      </div>

      <WeeklyOverview />

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Transactions
            </h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="appearance-none bg-white text-sm border border-gray-300 rounded-lg px-3 py-2 pr-8 min-w-30"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="all">All</option>
                  <option value="staff">Staff</option>
                  <option value="customer">Customer</option>
                  <option value="store">Store</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <FiChevronDown className=" text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {data &&
            data.map((transaction, index) => (
              <div
                key={index}
                className="p-4 flex items-center justify-between active:bg-gray-50 transition"
              >
                <Link
                  className="flex items-center gap-3 flex-1"
                  to={getNavigationLink(transaction)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 truncate">
                      {transaction.account.name}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="capitalize">
                        {formatEnum(transaction.account.accountType)}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="truncate">
                        {transaction.account.phone}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="text-right ml-2">
                  <div
                    className={`font-semibold ${getAmountColor(
                      transaction.transactionType
                    )}`}
                  >
                    {transaction.amountChange < 0 ? '+' : '-'}
                    {formatAmount(transaction.amount)}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {formatEnum(transaction.transactionType)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

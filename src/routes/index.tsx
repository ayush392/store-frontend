import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { ListSkeleton } from '../components/placeholders/ListSkeleton';
import { SkeletonWrapper } from '../components/placeholders/SkeletonWrapper';
import { PullToRefresh } from '../components/PullToRefresh';
import { SectionHeader } from '../components/SectionHeader';
import { TransactionImageViewer } from '../components/TransactionImageViewer';
import { Avatar } from '../components/ui/Avatar';
import { ErrorState } from '../components/ui/ErrorState';
import WeeklyOverview from '../components/WeeklyOverview';
import { fetcher } from '../lib/fetcher';
import { formatAmount, formatEnum, getAmountColor, getAmountSymbol } from '../shared/format';
import { CustomerIcon, StaffIcon, StoreIcon } from '../shared/icons';
import { accountTone } from '../shared/theme';
import type { RecentTrans } from '../shared/types';
import { haptics } from '../shared/utils/haptics';

export const Route = createFileRoute('/')({
  component: HomePage
});

const actions = [
  { key: 'customers', label: 'Customer', icon: CustomerIcon, tone: accountTone.CUSTOMER },
  { key: 'staffs', label: 'Staff', icon: StaffIcon, tone: accountTone.STAFF },
  { key: 'stores', label: 'Store', icon: StoreIcon, tone: accountTone.STORE }
] as const;

function HomePage() {
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('all');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['recent'],
    queryFn: () => fetcher<RecentTrans[]>('/transaction/recent'),
    staleTime: 5 * 60 * 1000
  });

  const getNavigationLink = (trans: RecentTrans) => {
    const { accountType, _id } = trans.account;
    return `/${accountType.toLowerCase()}s/${_id}`;
  };

  const handleRefresh = async () => {
    await Promise.all([refetch(), queryClient.invalidateQueries({ queryKey: ['graph'] })]);
  };

  const filteredData = data?.filter(
    (t) => activeFilter === 'all' || t.account.accountType.toLowerCase() === activeFilter
  );

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex flex-col gap-4">
        {/* Quick add tiles */}
        <div className="grid grid-cols-3 gap-3">
          {actions.map(({ key, label, icon: Icon, tone }) => (
            <Link
              key={key}
              to={`/${key}/new`}
              onClick={() => haptics.selection()}
              className="card flex flex-col items-center p-3 text-center transition duration-150 active:scale-95 active:bg-slate-50"
            >
              <div
                className={`mb-2 flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${tone}`}
              >
                <Icon size={22} />
              </div>
              <span className="text-[13px] leading-tight font-semibold text-slate-800">
                {label}
              </span>
              <span className="mt-0.5 text-[11px] font-medium text-slate-400">Add new</span>
            </Link>
          ))}
        </div>

        <WeeklyOverview />

        {/* Recent transactions */}
        <div className="card-list">
          <SectionHeader
            title="Recent Transactions"
            filterOptions={['all', 'staff', 'customer', 'store']}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {error ? (
            <div className="p-3">
              <ErrorState message={error.message} onRetry={() => refetch()} />
            </div>
          ) : (
            <SkeletonWrapper<RecentTrans[]>
              isLoading={isLoading}
              skeleton={<ListSkeleton />}
              data={filteredData}
              message="No recent transactions"
            >
              <div className="list-divider">
                {filteredData?.map((transaction) => (
                  <div key={transaction._id} className="list-row">
                    <Link
                      className="flex items-center gap-3"
                      to={getNavigationLink(transaction)}
                      onClick={() => haptics.selection()}
                    >
                      <Avatar
                        name={transaction.account.name}
                        accountType={transaction.account.accountType}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
                          {transaction.account.name}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <span className="font-medium">
                            {formatEnum(transaction.account.accountType)}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{transaction.account.phone}</span>
                        </div>
                      </div>

                      <div className="ml-2 shrink-0 text-right">
                        <div
                          className={`text-sm font-bold tracking-tight tabular-nums ${getAmountColor(
                            transaction.transactionType
                          )}`}
                        >
                          {getAmountSymbol(transaction.amountChange)}
                          {formatAmount(transaction.amount)}
                        </div>
                        <div className="mt-0.5 text-[11px] font-medium text-slate-400">
                          {formatEnum(transaction.transactionType)}
                        </div>
                      </div>
                    </Link>

                    <TransactionImageViewer transaction={transaction} />
                  </div>
                ))}
              </div>
            </SkeletonWrapper>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
}

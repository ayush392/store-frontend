import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { SectionHeader } from '../components/SectionHeader';
import WeeklyOverview from '../components/WeeklyOverview';
import { fetcher } from '../lib/fetcher';
import {
  formatAmount,
  formatEnum,
  getAmountColor,
  getAmountSymbol
} from '../shared/format';
import { CustomerIcon, StaffIcon, StoreIcon } from '../shared/icons';
import type { RecentTrans } from '../shared/types';
import { queryKeys } from '../shared/queryKeys';
import { ListSkeleton } from '../components/placeholders/ListSkeleton';
import { SkeletonWrapper } from '../components/placeholders/SkeletonWrapper';
import { TransactionImageViewer } from '../components/TransactionImageViewer';
import { ErrorState } from '../components/ErrorState';
import { accountDetailLink } from '../shared/accountLinks';

export const Route = createFileRoute('/')({
  component: HomePage
});

const actions = [
  { key: 'customers', label: 'Add Customer', icon: CustomerIcon },
  { key: 'staffs', label: 'Add Staff', icon: StaffIcon },
  { key: 'stores', label: 'Add Store', icon: StoreIcon }
] as const;

function HomePage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.recent(),
    queryFn: () => fetcher<RecentTrans[]>('/transaction/recent'),
    staleTime: 5 * 60 * 1000
  });

  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={() => refetch()}
        isRetrying={isFetching}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="sr-only">Home</h1>

      <nav aria-label="Quick add" className="grid grid-cols-3 gap-3">
        {actions.map(({ key, label, icon: Icon }) => (
          <Link
            key={key}
            to={`/${key}/new`}
            className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl bg-surface px-2 py-3 text-center shadow-sm active:bg-surface-muted"
          >
            <Icon size={22} className="text-primary" aria-hidden="true" />
            <span className="text-sm font-medium leading-tight text-fg">
              {label}
            </span>
          </Link>
        ))}
      </nav>

      <WeeklyOverview />

      {/* The backend's /transaction/recent returns today's transactions. */}
      <section className="overflow-hidden rounded-xl bg-surface shadow-sm">
        <SectionHeader title="Today's transactions" />

        <SkeletonWrapper<RecentTrans[]>
          isLoading={isLoading}
          skeleton={<ListSkeleton />}
          data={data}
          message="No transactions today"
        >
          <ul className="divide-y divide-line">
            {data?.map((transaction) => (
              <li key={transaction._id}>
                <Link
                  {...accountDetailLink(
                    transaction.account.accountType,
                    transaction.account._id
                  )}
                  className="flex items-center gap-3 px-4 py-3 active:bg-surface-muted"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-fg">
                      {transaction.account.name}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-fg-secondary">
                      <span>{formatEnum(transaction.account.accountType)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate tabular-nums">
                        {transaction.account.phone}
                      </span>
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p
                      className={`font-semibold tabular-nums ${getAmountColor(
                        transaction.transactionType
                      )}`}
                    >
                      {getAmountSymbol(transaction.amountChange)}
                      {formatAmount(transaction.amount)}
                    </p>
                    <p className="text-sm text-fg-secondary">
                      {formatEnum(transaction.transactionType)}
                    </p>
                  </div>
                </Link>

                {/* Bill thumbnails are buttons, so they sit outside the link. */}
                {transaction.images?.length ? (
                  <div className="-mt-1 px-4 pb-3">
                    <TransactionImageViewer transaction={transaction} />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </SkeletonWrapper>
      </section>
    </div>
  );
}

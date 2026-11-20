import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { AccountListItem } from '../../components/AccountListItem';
import { SectionHeader } from '../../components/SectionHeader';
import { fetcher } from '../../lib/fetcher';
import type { Account } from '../../shared/types';
import { queryKeys } from '../../shared/queryKeys';
import { ListSkeleton } from '../../components/placeholders/ListSkeleton';
import { SkeletonWrapper } from '../../components/placeholders/SkeletonWrapper';
import { FloatingButton } from '../../components/FloatingButton';
import { ErrorState } from '../../components/ErrorState';
import { PullToRefresh } from '../../components/PullToRefresh';

export const Route = createFileRoute('/stores/')({
  component: StoresPage
});

function StoresPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.accountList('STORE'),
    queryFn: () => fetcher<Account[]>('/account?accountType=STORE')
  });

  // Keep showing cached data if a refresh fails; the error screen is only
  // for when nothing has loaded yet.
  if (error && !data) {
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
      <PullToRefresh queryKeys={[queryKeys.accountList('STORE')]} />
      <section className="overflow-hidden rounded-xl bg-surface shadow-sm">
        <SectionHeader title="Stores" as="h1" />

        <SkeletonWrapper<Account[]>
          isLoading={isLoading}
          skeleton={<ListSkeleton showButton={true} />}
          data={data}
          message="No stores yet"
        >
          <ul className="divide-y divide-line">
            {data?.map((store) => (
              <AccountListItem
                key={store._id}
                // The list endpoint doesn't return accountType.
                account={{ ...store, accountType: 'STORE' }}
              />
            ))}
          </ul>
        </SkeletonWrapper>
      </section>

      <FloatingButton link="/stores/new" label="Store" />
    </div>
  );
}

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

export const Route = createFileRoute('/stores/')({
  component: StoresPage
});

function StoresPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.accountList('STORE'),
    queryFn: () => fetcher<Account[]>('/account?accountType=STORE')
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

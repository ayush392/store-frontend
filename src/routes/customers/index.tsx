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

export const Route = createFileRoute('/customers/')({
  component: CustomersPage
});

function CustomersPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.accountList('CUSTOMER'),
    queryFn: () => fetcher<Account[]>('/account?accountType=CUSTOMER')
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
        <SectionHeader title="Customers" as="h1" />

        <SkeletonWrapper<Account[]>
          isLoading={isLoading}
          skeleton={<ListSkeleton showButton={true} />}
          data={data}
          message="No customers yet"
        >
          <ul className="divide-y divide-line">
            {data?.map((customer) => (
              <AccountListItem
                key={customer._id}
                // The list endpoint doesn't return accountType.
                account={{ ...customer, accountType: 'CUSTOMER' }}
              />
            ))}
          </ul>
        </SkeletonWrapper>
      </section>

      <FloatingButton link="/customers/new" label="Customer" />
    </div>
  );
}

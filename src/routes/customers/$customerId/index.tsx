import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '../../../components/Layout';
import { ProfileCard } from '../../../components/ProfileCard';
import { SectionHeader } from '../../../components/SectionHeader';
import { TransactionList } from '../../../components/TransactionList';
import { fetcher } from '../../../lib/fetcher';
import type { Transactions, UserDetails } from '../../../shared/types';
import { queryKeys } from '../../../shared/queryKeys';
import { ListSkeleton } from '../../../components/placeholders/ListSkeleton';
import { ProfileCardSkeleton } from '../../../components/placeholders/ProfileSkeleton';
import { SkeletonWrapper } from '../../../components/placeholders/SkeletonWrapper';
import { FloatingButton } from '../../../components/FloatingButton';
import { ErrorState } from '../../../components/ErrorState';

export const Route = createFileRoute('/customers/$customerId/')({
  component: CustomerDetailsPage
});

function CustomerDetailsPage() {
  const { customerId } = Route.useParams();
  const title = 'Customer Details';

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.accountDetail('CUSTOMER', customerId),
    queryFn: () => fetcher<UserDetails>(`/account/${customerId}/`)
  });

  if (error) {
    return (
      <PageLayout title={title}>
        <ErrorState
          error={error}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout title={title}>
      <SkeletonWrapper<UserDetails>
        isLoading={isLoading}
        skeleton={<ProfileCardSkeleton />}
        data={data}
      >
        {data && (
          <ProfileCard profile={data.profile} employment={data.employment} />
        )}
      </SkeletonWrapper>

      <section className="overflow-hidden rounded-xl bg-surface shadow-sm">
        <SectionHeader title="Transactions" />
        <SkeletonWrapper<Transactions[]>
          isLoading={isLoading}
          skeleton={<ListSkeleton />}
          data={data?.transactions}
          message="No transactions yet"
        >
          {data && (
            <TransactionList
              transactions={data.transactions}
              accountType="CUSTOMER"
            />
          )}
        </SkeletonWrapper>
      </section>

      <FloatingButton link={`./transactions/new`} label="Pay" />
    </PageLayout>
  );
}

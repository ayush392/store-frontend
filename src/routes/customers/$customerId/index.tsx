import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '../../../components/Layout';
import { ProfileCard } from '../../../components/ProfileCard';
import { SectionHeader } from '../../../components/SectionHeader';
import { TransactionList } from '../../../components/TransactionList';
import { fetcher } from '../../../lib/fetcher';
import type { Transactions, UserDetails } from '../../../shared/types';
import { ListSkeleton } from '../../../components/placeholders/ListSkeleton';
import { ProfileCardSkeleton } from '../../../components/placeholders/ProfileSkeleton';
import { SkeletonWrapper } from '../../../components/placeholders/SkeletonWrapper';
import { FloatingButton } from '../../../components/FloatingButton';

export const Route = createFileRoute('/customers/$customerId/')({
  component: CustomerDetailsPage
});

function CustomerDetailsPage() {
  const { customerId } = Route.useParams();
  const title = 'Customer Details';

  const { data, isLoading, error } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => fetcher<UserDetails>(`/account/${customerId}/`)
  });

  if (error) {
    return (
      <PageLayout title={title}>
        <div>{error.message}</div>
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

      <div className="bg-white rounded-lg shadow-sm">
        <SectionHeader title="Transactions" filterOptions={['all']} />
        <SkeletonWrapper<Transactions[]>
          isLoading={isLoading}
          skeleton={<ListSkeleton />}
          data={data?.transactions}
          message="No transactions found"
        >
          {data && (
            <TransactionList
              transactions={data.transactions}
              type="customers"
            />
          )}
        </SkeletonWrapper>
      </div>

      <FloatingButton link={`./transactions/new`} label="Pay" />
    </PageLayout>
  );
}

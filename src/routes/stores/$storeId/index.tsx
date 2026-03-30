import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '../../../components/Layout';
import { ProfileCard } from '../../../components/ProfileCard';
import { SectionHeader } from '../../../components/SectionHeader';
import { TransactionList } from '../../../components/TransactionList';
import { fetcher } from '../../../lib/fetcher';
import type { UserDetails } from '../../../shared/types';

export const Route = createFileRoute('/stores/$storeId/')({
  component: StoreDetailsPage
});

function StoreDetailsPage() {
  const { storeId } = Route.useParams();
  const title = 'Store Details';

  const { data, isLoading, error } = useQuery({
    queryKey: ['store', storeId],
    queryFn: () => fetcher<UserDetails>(`/account/${storeId}/`)
  });

  if (isLoading) {
    return <PageLayout title={title}>Loading...</PageLayout>;
  }

  if (error) {
    return (
      <PageLayout title={title}>
        <div>{error.message}</div>
      </PageLayout>
    );
  }

  if (!data) {
    return (
      <PageLayout title={title}>
        <div>Store not found</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={title}>
      <ProfileCard profile={data.profile} employment={data.employment} />
      <div className="bg-white rounded-lg shadow-sm">
        <SectionHeader title="Transactions" filterOptions={['all']} />
        <TransactionList transactions={data.transactions} />
      </div>
    </PageLayout>
  );
}

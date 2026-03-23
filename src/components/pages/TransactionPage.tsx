import type { ObjectId } from '@store/schemas';
import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../../lib/fetcher';
import type { Account } from '../../shared/types';
import { PageLayout } from '../Layout';
import { TransactionForm } from '../TransactionForm';

type Props = {
  mode: 'create' | 'edit';
  accountId: ObjectId;
};

export function TransactionPage({ mode, accountId }: Props) {
  const title = mode === 'edit' ? 'Edit Transaction' : 'Create Transaction';

  const { data, isLoading, error } = useQuery({
    queryKey: ['basic', accountId],
    queryFn: () => fetcher<Account>(`/account/${accountId}/basic`),
    staleTime: 60 * 60 * 1000,
    enabled: !!accountId
  });

  if (mode === 'edit') {
    return (
      <PageLayout title={title}>
        <div className="text-2xl">Under Construction!</div>
      </PageLayout>
    );
  }

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

  return (
    <PageLayout title={title}>
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 space-y-5">
        <TransactionForm name={data?.name ?? '...'} />
      </div>
    </PageLayout>
  );
}

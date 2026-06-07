import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../../lib/fetcher';
import type { Account, Transactions } from '../../shared/types';
import { PageLayout } from '../Layout';
import { TransactionForm } from '../TransactionForm';
import type { ObjectId } from '../../shared/schemas/common.schema';

type Props = {
  mode: 'create' | 'edit';
  accountId: ObjectId;
  transactionId?: ObjectId;
};

export function TransactionPage({ mode, accountId, transactionId }: Props) {
  const title = mode === 'edit' ? 'Edit Transaction' : 'Create Transaction';

  const { data, isLoading, error } = useQuery({
    queryKey: ['account', accountId, 'basic'],
    queryFn: () => fetcher<Account>(`/account/${accountId}/basic`),
    staleTime: 60 * 60 * 1000
  });

  const {
    data: transactionData,
    isLoading: isTransLoading,
    error: transError
  } = useQuery({
    queryKey: ['transaction', transactionId, 'basic'],
    queryFn: () => fetcher<Transactions>(`/transaction/${transactionId}/basic`),
    staleTime: 60 * 60 * 1000,
    enabled: !!transactionId && mode === 'edit'
  });

  if (isLoading || isTransLoading) {
    return <PageLayout title={title}>Loading...</PageLayout>;
  }

  if (error || transError) {
    return (
      <PageLayout title={title}>
        <div>{error?.message || transError?.message}</div>
      </PageLayout>
    );
  }

  if (!data || (transactionId && !transactionData)) {
    return <div>Could not find given account</div>;
  }

  return (
    <PageLayout title={title}>
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 space-y-5">
        <TransactionForm
          name={data.name}
          accountId={accountId}
          transaction={transactionData}
        />
      </div>
    </PageLayout>
  );
}

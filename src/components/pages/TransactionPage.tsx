import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../../lib/fetcher';
import type { ObjectId } from '../../shared/schemas/common.schema';
import type { Account, Transactions } from '../../shared/types';
import { PageLayout } from '../Layout';
import { FormSkeleton } from '../placeholders/FormSkeleton';
import { TransactionForm } from '../TransactionForm';
import { ErrorState } from '../ui/ErrorState';

type Props = {
  mode: 'create' | 'edit';
  accountId: ObjectId;
  transactionId?: ObjectId;
};

export function TransactionPage({ mode, accountId, transactionId }: Props) {
  const title = mode === 'edit' ? 'Edit Transaction' : 'New Transaction';

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['account', accountId, 'basic'],
    queryFn: () => fetcher<Account>(`/account/${accountId}/basic`),
    staleTime: 60 * 60 * 1000
  });

  const {
    data: transactionData,
    isLoading: isTransLoading,
    error: transError,
    refetch: refetchTrans
  } = useQuery({
    queryKey: ['transaction', transactionId, 'basic'],
    queryFn: () => fetcher<Transactions>(`/transaction/${transactionId}/basic`),
    staleTime: 60 * 60 * 1000,
    enabled: !!transactionId && mode === 'edit'
  });

  const renderBody = () => {
    if (isLoading || isTransLoading) return <FormSkeleton fields={4} />;

    if (error || transError) {
      return (
        <ErrorState
          message={error?.message || transError?.message}
          onRetry={() => {
            refetch();
            if (transactionId) refetchTrans();
          }}
        />
      );
    }

    if (!data || (transactionId && !transactionData)) {
      return <ErrorState message="Could not find this account" />;
    }

    return (
      <div className="card p-4">
        <TransactionForm name={data.name} accountId={accountId} transaction={transactionData} />
      </div>
    );
  };

  return (
    <PageLayout title={title} description={data?.name}>
      {renderBody()}
    </PageLayout>
  );
}

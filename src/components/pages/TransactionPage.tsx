import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../../lib/fetcher';
import type { Account, Transactions } from '../../shared/types';
import { PageLayout } from '../Layout';
import { TransactionForm } from '../TransactionForm';
import type { ObjectId } from '../../shared/schemas/common.schema';
import { queryKeys } from '../../shared/queryKeys';
import { ErrorState } from '../ErrorState';

type Props = {
  mode: 'create' | 'edit';
  accountId: ObjectId;
  transactionId?: ObjectId;
};

export function TransactionPage({ mode, accountId, transactionId }: Props) {
  const title = mode === 'edit' ? 'Edit Transaction' : 'Create Transaction';

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.accountBasic(accountId),
    queryFn: () => fetcher<Account>(`/account/${accountId}/basic`),
    staleTime: 60 * 60 * 1000
  });

  const {
    data: transactionData,
    isLoading: isTransLoading,
    error: transError,
    refetch: refetchTransaction,
    isFetching: isTransFetching
  } = useQuery({
    queryKey: queryKeys.transactionBasic(transactionId),
    queryFn: () => fetcher<Transactions>(`/transaction/${transactionId}/basic`),
    staleTime: 60 * 60 * 1000,
    enabled: !!transactionId && mode === 'edit'
  });

  if (isLoading || isTransLoading) {
    return <PageLayout title={title}>Loading...</PageLayout>;
  }

  const pageError = error ?? transError;
  if (pageError) {
    return (
      <PageLayout title={title}>
        <ErrorState
          error={pageError}
          onRetry={() => {
            if (error) refetch();
            if (transError) refetchTransaction();
          }}
          isRetrying={isFetching || isTransFetching}
        />
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
          key={transactionId ?? accountId}
          name={data.name}
          accountId={accountId}
          accountType={data.accountType}
          transaction={transactionData}
        />
      </div>
    </PageLayout>
  );
}

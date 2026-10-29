import { useQuery } from '@tanstack/react-query';
import { Link, useCanGoBack, useRouter } from '@tanstack/react-router';
import { fetcher } from '../../lib/fetcher';
import type { Account, Transactions } from '../../shared/types';
import { PageLayout } from '../Layout';
import { TransactionForm } from '../TransactionForm';
import type { ObjectId } from '../../shared/schemas/common.schema';
import { queryKeys } from '../../shared/queryKeys';
import { accountDetailLink } from '../../shared/accountLinks';
import { ErrorState } from '../ErrorState';
import { buttonClass } from '../buttonClass';

type Props = {
  mode: 'create' | 'edit';
  accountId: ObjectId;
  transactionId?: ObjectId;
};

export function TransactionPage({ mode, accountId, transactionId }: Props) {
  const title = mode === 'edit' ? 'Edit Transaction' : 'Create Transaction';
  const router = useRouter();
  const canGoBack = useCanGoBack();

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
    return (
      <PageLayout title={title}>
        <FormSkeleton />
      </PageLayout>
    );
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

  // Not found, or the URL pairs a transaction with a different account.
  if (
    !data ||
    (transactionId &&
      (!transactionData || transactionData.accountId !== accountId))
  ) {
    return (
      <PageLayout title={title}>
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-xl bg-surface p-8 text-center shadow-sm"
        >
          <p className="text-base font-semibold text-fg">
            {data ? 'Transaction not found' : 'Account not found'}
          </p>
          <p className="text-sm text-fg-secondary">
            It may have been deleted, or the link is wrong.
          </p>
          <Link to="/" className={buttonClass({ variant: 'secondary' })}>
            Go to Home
          </Link>
        </div>
      </PageLayout>
    );
  }

  // After saving, return to where the user came from; if the page was opened
  // directly (no in-app history), go to the account instead.
  const onSaved = () => {
    if (canGoBack) router.history.back();
    else
      router.navigate({
        ...accountDetailLink(data.accountType, accountId),
        replace: true
      });
  };

  return (
    <PageLayout title={title}>
      <div className="rounded-xl bg-surface p-4 shadow-sm">
        <TransactionForm
          key={transactionId ?? accountId}
          name={data.name}
          accountId={accountId}
          accountType={data.accountType}
          transaction={transactionData}
          onSaved={onSaved}
        />
      </div>
    </PageLayout>
  );
}

const FormSkeleton = () => (
  <div
    role="status"
    aria-label="Loading form"
    className="animate-pulse space-y-4 rounded-xl bg-surface p-4 shadow-sm"
  >
    <div className="h-10 rounded-lg bg-line/60" />
    <div className="grid grid-cols-2 gap-4">
      <div className="h-16 rounded-lg bg-line" />
      <div className="h-16 rounded-lg bg-line" />
    </div>
    <div className="h-16 rounded-lg bg-line" />
    <div className="h-24 rounded-lg bg-line" />
    <div className="h-11 rounded-lg bg-line/60" />
    <span className="sr-only">Loading form...</span>
  </div>
);

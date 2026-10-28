import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../../lib/fetcher';
import { formatEnum } from '../../shared/format';
import type { AccountType } from '../../shared/schemas/account.schema';
import type { ObjectId } from '../../shared/schemas/common.schema';
import type { Account } from '../../shared/types';
import { AccountForm } from '../AccountForm';
import { PageLayout } from '../Layout';
import { FormSkeleton } from '../placeholders/FormSkeleton';
import { ErrorState } from '../ui/ErrorState';

type Props = {
  accountType: AccountType;
  mode: 'create' | 'edit';
  accountId?: ObjectId;
};

export function AccountPage({ accountType, mode, accountId }: Props) {
  const label = formatEnum(accountType);
  const title = mode === 'edit' ? `Edit ${label}` : `New ${label}`;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['account', accountId, 'basic'],
    queryFn: () => fetcher<Account>(`/account/${accountId}/basic`),
    staleTime: 10 * 60 * 1000,
    enabled: mode === 'edit' && !!accountId
  });

  return (
    <PageLayout title={title} description={mode === 'edit' ? data?.name : undefined}>
      {isLoading ? (
        <FormSkeleton fields={5} />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : (
        <div className="card p-4">
          <AccountForm mode={mode} accountType={accountType} account={data} />
        </div>
      )}
    </PageLayout>
  );
}

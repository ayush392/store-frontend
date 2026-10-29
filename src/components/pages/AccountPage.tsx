import { useQuery } from '@tanstack/react-query';
import { formatEnum } from '../../shared/format';
import type { AccountType } from '../../shared/schemas/account.schema';
import type { ObjectId } from '../../shared/schemas/common.schema';
import { AccountForm } from '../AccountForm';
import { PageLayout } from '../Layout';
import { fetcher } from '../../lib/fetcher';
import type { Account } from '../../shared/types';
import { queryKeys } from '../../shared/queryKeys';
import { ErrorState } from '../ErrorState';

type Props = {
  accountType: AccountType;
  mode: 'create' | 'edit';
  accountId?: ObjectId;
};

export function AccountPage({ accountType, mode, accountId }: Props) {
  const title =
    mode === 'edit'
      ? `Edit ${formatEnum(accountType)}'s Profile`
      : `Create new ${formatEnum(accountType)}`;

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.accountBasic(accountId),
    queryFn: () => fetcher<Account>(`/account/${accountId}/basic`),
    staleTime: 10 * 60 * 1000, //10min
    enabled: mode === 'edit'
  });

  if (isLoading) {
    return <PageLayout title={title}>Loading...</PageLayout>;
  }

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
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 space-y-5">
        <AccountForm
          key={data?._id ?? 'new'}
          mode={mode}
          accountType={accountType}
          account={data}
        />
      </div>
    </PageLayout>
  );
}

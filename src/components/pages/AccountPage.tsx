import { useQuery } from '@tanstack/react-query';
import { useCanGoBack, useRouter } from '@tanstack/react-router';
import { formatEnum } from '../../shared/format';
import type { AccountType } from '../../shared/schemas/account.schema';
import type { ObjectId } from '../../shared/schemas/common.schema';
import { AccountForm } from '../AccountForm';
import { PageLayout } from '../Layout';
import { fetcher } from '../../lib/fetcher';
import type { Account } from '../../shared/types';
import { queryKeys } from '../../shared/queryKeys';
import { accountDetailLink, accountListLink } from '../../shared/accountLinks';
import { ErrorState } from '../ErrorState';
import { FormSkeleton } from '../placeholders/FormSkeleton';

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
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.accountBasic(accountId),
    queryFn: () => fetcher<Account>(`/account/${accountId}/basic`),
    staleTime: 10 * 60 * 1000, //10min
    enabled: mode === 'edit'
  });

  if (isLoading) {
    return (
      <PageLayout title={title}>
        <FormSkeleton />
      </PageLayout>
    );
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

  // After saving, return to where the user came from. If the page was opened
  // directly (no in-app history), go to the account (edit) or its list (new).
  const onSaved = () => {
    if (canGoBack) {
      router.history.back();
    } else if (mode === 'edit' && accountId) {
      router.navigate({
        ...accountDetailLink(accountType, accountId),
        replace: true
      });
    } else {
      router.navigate({ ...accountListLink(accountType), replace: true });
    }
  };

  return (
    <PageLayout title={title}>
      <div className="rounded-xl bg-surface p-4 shadow-sm">
        <AccountForm
          key={data?._id ?? 'new'}
          mode={mode}
          accountType={accountType}
          account={data}
          onSaved={onSaved}
        />
      </div>
    </PageLayout>
  );
}

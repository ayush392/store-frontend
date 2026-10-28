import { useQuery } from '@tanstack/react-query';
import { fetcher } from '../../lib/fetcher';
import { formatEnum } from '../../shared/format';
import type { AccountType } from '../../shared/schemas/account.schema';
import type { Account } from '../../shared/types';
import { AccountRow } from '../AccountRow';
import { FloatingButton } from '../FloatingButton';
import { ListSkeleton } from '../placeholders/ListSkeleton';
import { SkeletonWrapper } from '../placeholders/SkeletonWrapper';
import { PullToRefresh } from '../PullToRefresh';
import { SectionHeader } from '../SectionHeader';
import { ErrorState } from '../ui/ErrorState';

type Props = {
  accountType: Exclude<AccountType, 'STAFF'>;
  /** Route segment and query key, e.g. "customers" */
  basePath: 'customers' | 'stores';
};

/** Shared list screen for customers and stores. */
export function AccountListPage({ accountType, basePath }: Props) {
  const label = formatEnum(accountType);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [basePath],
    queryFn: () => fetcher<Account[]>(`/account?accountType=${accountType}`)
  });

  if (error) return <ErrorState message={error.message} onRetry={() => refetch()} />;

  return (
    <PullToRefresh onRefresh={() => refetch()}>
      <div className="card-list">
        <SectionHeader title={`${label}s`} count={data?.length} />

        <SkeletonWrapper<Account[]>
          isLoading={isLoading}
          skeleton={<ListSkeleton showButton />}
          data={data}
          message={`No ${label.toLowerCase()}s yet`}
        >
          <div className="list-divider">
            {data?.map((account) => (
              <AccountRow
                key={account._id}
                name={account.name}
                accountType={accountType}
                due={account.currentOutstanding}
                detailLink={`/${basePath}/${account._id}`}
                payLink={`/${basePath}/${account._id}/transactions/new`}
                subtitle={account.phone}
              />
            ))}
          </div>
        </SkeletonWrapper>
      </div>

      <FloatingButton link={`/${basePath}/new`} label={label} />
    </PullToRefresh>
  );
}

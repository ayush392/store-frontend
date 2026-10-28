import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { FiCalendar, FiList } from 'react-icons/fi';
import { MdCurrencyRupee } from 'react-icons/md';
import { fetcher } from '../../lib/fetcher';
import { formatEnum } from '../../shared/format';
import type { AccountType } from '../../shared/schemas/account.schema';
import type { Transactions, UserDetails } from '../../shared/types';
import { Calendar } from '../Calendar';
import { FloatingButton } from '../FloatingButton';
import { PageLayout } from '../Layout';
import { ListSkeleton } from '../placeholders/ListSkeleton';
import { ProfileCardSkeleton } from '../placeholders/ProfileSkeleton';
import { SkeletonWrapper } from '../placeholders/SkeletonWrapper';
import { ProfileCard } from '../ProfileCard';
import { PullToRefresh } from '../PullToRefresh';
import { SectionHeader } from '../SectionHeader';
import { TransactionList } from '../TransactionList';
import { ErrorState } from '../ui/ErrorState';
import { SegmentedControl } from '../ui/SegmentedControl';

type Props = {
  accountId: string;
  accountType: AccountType;
  basePath: 'customers' | 'stores' | 'staffs';
};

type Tab = 'transactions' | 'attendance';

/** Shared detail screen: profile, then transactions (and attendance for staff). */
export function AccountDetailPage({ accountId, accountType, basePath }: Props) {
  const label = formatEnum(accountType);
  const isStaff = accountType === 'STAFF';
  const [activeTab, setActiveTab] = useState<Tab>('transactions');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [accountType.toLowerCase(), accountId],
    queryFn: () => fetcher<UserDetails>(`/account/${accountId}/`)
  });

  const title = data?.profile.name ?? label;

  if (error) {
    return (
      <PageLayout title={label}>
        <ErrorState message={error.message} onRetry={() => refetch()} />
      </PageLayout>
    );
  }

  return (
    <PageLayout title={title} description={data ? label : undefined}>
      <PullToRefresh onRefresh={() => refetch()}>
        <div className="flex flex-col gap-4">
          <SkeletonWrapper<UserDetails>
            isLoading={isLoading}
            skeleton={<ProfileCardSkeleton />}
            data={data}
          >
            {data && <ProfileCard profile={data.profile} employment={data.employment} />}
          </SkeletonWrapper>

          {isStaff && (
            <SegmentedControl<Tab>
              value={activeTab}
              onChange={setActiveTab}
              options={[
                { value: 'transactions', label: 'Transactions', icon: FiList },
                { value: 'attendance', label: 'Attendance', icon: FiCalendar }
              ]}
            />
          )}

          {activeTab === 'transactions' ? (
            <div className="card-list">
              <SectionHeader title="Transactions" count={data?.transactions.length} />
              <SkeletonWrapper<Transactions[]>
                isLoading={isLoading}
                skeleton={<ListSkeleton showAvatar={false} />}
                data={data?.transactions}
                message="No transactions yet"
              >
                {data && <TransactionList transactions={data.transactions} type={basePath} />}
              </SkeletonWrapper>
            </div>
          ) : (
            <div className="card">
              <Calendar accountId={accountId} employmentId={data?.employment?.[0]?._id} />
            </div>
          )}
        </div>

        <FloatingButton
          link={`/${basePath}/${accountId}/transactions/new`}
          label="Pay"
          icon={MdCurrencyRupee}
        />
      </PullToRefresh>
    </PageLayout>
  );
}

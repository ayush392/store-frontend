import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { FiCalendar, FiList } from 'react-icons/fi';
import { Calendar } from '../../../components/Calendar';
import { PageLayout } from '../../../components/Layout';
import { ProfileCard } from '../../../components/ProfileCard';
import { TransactionList } from '../../../components/TransactionList';
import { fetcher } from '../../../lib/fetcher';
import type { Transactions, UserDetails } from '../../../shared/types';
import { queryKeys } from '../../../shared/queryKeys';
import { ListSkeleton } from '../../../components/placeholders/ListSkeleton';
import { ProfileCardSkeleton } from '../../../components/placeholders/ProfileSkeleton';
import { SkeletonWrapper } from '../../../components/placeholders/SkeletonWrapper';
import { FloatingButton } from '../../../components/FloatingButton';
import { ErrorState } from '../../../components/ErrorState';
import { PullToRefresh } from '../../../components/PullToRefresh';

const tabs = [
  { id: 'transactions', label: 'Transactions', icon: FiList },
  { id: 'attendance', label: 'Attendance', icon: FiCalendar }
] as const;

export const Route = createFileRoute('/staffs/$staffId/')({
  component: StaffDetailsPage
});

function StaffDetailsPage() {
  const { staffId } = Route.useParams();
  const title = 'Staff Details';
  const [activeTab, setActiveTab] = useState<'transactions' | 'attendance'>(
    'transactions'
  );
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.accountDetail('STAFF', staffId),
    queryFn: () => fetcher<UserDetails>(`/account/${staffId}/`)
  });

  // Keep showing cached data if a refresh fails; the error screen is only
  // for when nothing has loaded yet.
  if (error && !data) {
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
      <PullToRefresh
        queryKeys={[
          queryKeys.accountDetail('STAFF', staffId),
          queryKeys.staffCalendars(staffId)
        ]}
      />
      <SkeletonWrapper<UserDetails>
        isLoading={isLoading}
        skeleton={<ProfileCardSkeleton />}
        data={data}
      >
        {data && (
          <ProfileCard profile={data.profile} employment={data.employment} />
        )}
      </SkeletonWrapper>

      <section className="overflow-hidden rounded-xl bg-surface shadow-sm">
        {/* Tabs */}
        <div role="tablist" aria-label="Staff details" className="flex border-b border-line">
          {tabs.map(({ id, label, icon: Icon }) => {
            const selected = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={selected}
                aria-controls={`panel-${id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(id)}
                onKeyDown={(e) => {
                  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                  const next = id === 'transactions' ? 'attendance' : 'transactions';
                  setActiveTab(next);
                  document.getElementById(`tab-${next}`)?.focus();
                }}
                className={`flex min-h-12 flex-1 items-center justify-center gap-2 border-b-2 px-4 font-medium ${
                  selected
                    ? 'border-primary text-primary'
                    : 'border-transparent text-fg-secondary active:bg-surface-muted'
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>

        {activeTab === 'transactions' && (
          <div role="tabpanel" id="panel-transactions" aria-labelledby="tab-transactions">
            <SkeletonWrapper<Transactions[]>
              isLoading={isLoading}
              skeleton={<ListSkeleton />}
              data={data?.transactions}
              message="No transactions yet"
            >
              {data && (
                <TransactionList
                  transactions={data.transactions}
                  accountType="STAFF"
                />
              )}
            </SkeletonWrapper>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div role="tabpanel" id="panel-attendance" aria-labelledby="tab-attendance">
            <Calendar
              accountId={staffId}
              employmentId={data?.employment?.[0]?._id}
            />
          </div>
        )}
      </section>

      <FloatingButton link={`./transactions/new`} label="Pay" />
    </PageLayout>
  );
}

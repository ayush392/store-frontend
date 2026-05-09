import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { FiCalendar, FiDollarSign } from 'react-icons/fi';
import { Calendar } from '../../../components/Calendar';
import { PageLayout } from '../../../components/Layout';
import { ProfileCard } from '../../../components/ProfileCard';
import { SectionHeader } from '../../../components/SectionHeader';
import { TransactionList } from '../../../components/TransactionList';
import { fetcher } from '../../../lib/fetcher';
import type { Transactions, UserDetails } from '../../../shared/types';
import { ListSkeleton } from '../../../components/placeholders/ListSkeleton';
import { ProfileCardSkeleton } from '../../../components/placeholders/ProfileSkeleton';
import { SkeletonWrapper } from '../../../components/placeholders/SkeletonWrapper';

export const Route = createFileRoute('/staffs/$staffId/')({
  component: StaffDetailsPage
});

function StaffDetailsPage() {
  const { staffId } = Route.useParams();
  const title = 'Staff Details';
  const [activeTab, setActiveTab] = useState<'transactions' | 'attendance'>(
    'transactions'
  );
  const { data, isLoading, error } = useQuery({
    queryKey: ['staff', staffId],
    queryFn: () => fetcher<UserDetails>(`/account/${staffId}/`)
  });

  if (error) {
    return (
      <PageLayout title={title}>
        <div>{error.message}</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={title}>
      <SkeletonWrapper<UserDetails>
        isLoading={isLoading}
        skeleton={<ProfileCardSkeleton />}
        data={data}
      >
        {data && (
          <ProfileCard profile={data!.profile} employment={data!.employment} />
        )}
      </SkeletonWrapper>

      <div className="bg-white rounded-lg shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'transactions'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center justify-center space-x-2">
              <FiDollarSign size={16} />
              <span>Transactions</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'attendance'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex items-center justify-center space-x-2">
              <FiCalendar size={16} />
              <span>Attendance</span>
            </div>
          </button>
        </div>

        {activeTab === 'transactions' && (
          <div>
            <SectionHeader title="Transactions" filterOptions={['all']} />
            <SkeletonWrapper<Transactions[]>
              isLoading={isLoading}
              skeleton={<ListSkeleton />}
              data={data?.transactions}
              message="No transactions found"
            >
              {data && <TransactionList transactions={data.transactions} />}
            </SkeletonWrapper>
          </div>
        )}

        {activeTab === 'attendance' && (
          <Calendar
            accountId={staffId}
            employmentId={data?.employment?.[0]?._id}
          />
        )}
      </div>
    </PageLayout>
  );
}

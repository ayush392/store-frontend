import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { FiDollarSign } from 'react-icons/fi';
import { SectionHeader } from '../../components/SectionHeader';
import { fetcher } from '../../lib/fetcher';
import { formatAmount } from '../../shared/format';
import { CustomerIcon } from '../../shared/icons';
import type { Account } from '../../shared/types';
import { ListSkeleton } from '../../components/placeholders/ListSkeleton';
import { SkeletonWrapper } from '../../components/placeholders/SkeletonWrapper';

export const Route = createFileRoute('/customers/')({
  component: CustomersPage
});

function CustomersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: () => fetcher<Account[]>('/account?accountType=CUSTOMER')
  });

  if (error) {
    console.log(error);
    return <div>{error.message}</div>;
  }

  return (
    <div className="relative space-y-4">
      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-sm">
        <SectionHeader title="Customers" filterOptions={['All']} />

        <SkeletonWrapper<Account[]>
          isLoading={isLoading}
          skeleton={<ListSkeleton showButton={true} />}
          data={data}
          message="No Customers found"
        >
          <div className="divide-y divide-gray-200">
            {data?.map((customer) => (
              <div key={`${customer._id}`} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <Link
                    to="/customers/$customerId"
                    params={{ customerId: customer._id }}
                    className="block flex-1 space-y-1"
                  >
                    <div className="font-semibold text-gray-800">
                      {customer.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {customer.phone}
                    </div>
                    <div className="text-xs text-gray-500">
                      {customer.address}
                    </div>
                  </Link>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">Due</div>
                      <div
                        className={`font-bold text-sm ${customer.currentOutstanding > 0 ? 'text-red-500' : 'text-gray-400'}`}
                      >
                        {formatAmount(customer.currentOutstanding)}
                      </div>
                    </div>
                    <Link
                      to="/customers/$customerId/transactions/new"
                      params={{ customerId: customer._id }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center space-x-1"
                    >
                      <FiDollarSign size={14} />
                      <span>Pay</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SkeletonWrapper>
      </div>

      {/* Floating Add Button */}
      <Link
        to="/customers/new"
        className="fixed right-5 bottom-24 z-50 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-4 py-3 flex items-center gap-2 border border-blue-500/40"
        aria-label="Add Customer"
      >
        <CustomerIcon size={18} />
        <span className="font-medium text-sm">Add Customer</span>
      </Link>
    </div>
  );
}

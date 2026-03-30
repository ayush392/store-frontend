import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { FiDollarSign } from 'react-icons/fi';
import { SectionHeader } from '../../components/SectionHeader';
import { fetcher } from '../../lib/fetcher';
import { formatAmount } from '../../shared/format';
import type { Account } from '../../shared/types';

export const Route = createFileRoute('/stores/')({
  component: StoresPage
});

function StoresPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['stores'],
    queryFn: () => fetcher<Account[]>('/account?accountType=STORE')
  });

  if (isLoading) return <div>Loading</div>;
  if (error) {
    console.log(error);
    return <div>{error.message}</div>;
  }
  if (!data) return <div>No staff found!</div>;

  return (
    <div className="relative space-y-4 pb-32">
      {/* store List */}
      <div className="bg-white rounded-lg shadow-sm">
        <SectionHeader title="Stores" filterOptions={['All']} />

        <div className="divide-y divide-gray-200">
          {data.map((store) => (
            <div key={`${store._id}`} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <Link
                  to="/stores/$storeId"
                  params={{ storeId: store._id }}
                  className="block flex-1 space-y-1"
                >
                  <div className="font-semibold text-gray-800">
                    {store.name}
                  </div>
                  <div className="text-sm text-gray-600">{store.phone}</div>
                  <div className="text-xs text-gray-500">{store.address}</div>
                </Link>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Due</div>
                    <div
                      className={`font-bold text-sm ${store.currentOutstanding > 0 ? 'text-red-500' : 'text-gray-400'}`}
                    >
                      {formatAmount(store.currentOutstanding)}
                    </div>
                  </div>
                  <Link
                    to="/stores/$storeId/transactions/new"
                    params={{ storeId: store._id }}
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
      </div>
    </div>
  );
}

import { createFileRoute } from '@tanstack/react-router';
import { AccountDetailPage } from '../../../components/pages/AccountDetailPage';

export const Route = createFileRoute('/stores/$storeId/')({
  component: StoreDetailsPage
});

function StoreDetailsPage() {
  const { storeId } = Route.useParams();
  return <AccountDetailPage accountId={storeId} accountType="STORE" basePath="stores" />;
}

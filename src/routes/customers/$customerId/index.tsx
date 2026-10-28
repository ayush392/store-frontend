import { createFileRoute } from '@tanstack/react-router';
import { AccountDetailPage } from '../../../components/pages/AccountDetailPage';

export const Route = createFileRoute('/customers/$customerId/')({
  component: CustomerDetailsPage
});

function CustomerDetailsPage() {
  const { customerId } = Route.useParams();
  return <AccountDetailPage accountId={customerId} accountType="CUSTOMER" basePath="customers" />;
}

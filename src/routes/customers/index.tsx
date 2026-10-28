import { createFileRoute } from '@tanstack/react-router';
import { AccountListPage } from '../../components/pages/AccountListPage';

export const Route = createFileRoute('/customers/')({
  component: CustomersPage
});

function CustomersPage() {
  return <AccountListPage accountType="CUSTOMER" basePath="customers" />;
}

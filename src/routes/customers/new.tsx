import { createFileRoute } from '@tanstack/react-router';
import { AccountPage } from '../../components/pages/AccountPage';

export const Route = createFileRoute('/customers/new')({
  component: CreateNewCustomer
});

function CreateNewCustomer() {
  return <AccountPage accountType="CUSTOMER" mode="create" />;
}

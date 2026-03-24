import { createFileRoute } from '@tanstack/react-router';
import { AccountPage } from '../../../components/pages/AccountPage';

export const Route = createFileRoute('/customers/$customerId/edit')({
  component: EditCustomerProfile
});

function EditCustomerProfile() {
  return <AccountPage mode="edit" accountType="CUSTOMER" />;
}

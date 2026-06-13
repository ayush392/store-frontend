import { createFileRoute } from '@tanstack/react-router';
import { AccountPage } from '../../../components/pages/AccountPage';
import { parseObjectId } from '../../../shared/parser';

export const Route = createFileRoute('/customers/$customerId/edit')({
  component: EditCustomerProfile,
  params: {
    parse: (params) => ({
      customerId: parseObjectId(params.customerId)
    })
  }
});

function EditCustomerProfile() {
  const { customerId } = Route.useParams();
  return (
    <AccountPage mode="edit" accountType="CUSTOMER" accountId={customerId} />
  );
}

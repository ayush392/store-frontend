import { createFileRoute } from '@tanstack/react-router';
import { AccountPage } from '../../../components/pages/AccountPage';

export const Route = createFileRoute('/stores/$storeId/edit')({
  component: EditStoreProfile
});

function EditStoreProfile() {
  return <AccountPage mode="edit" accountType="STORE" />;
}

import { createFileRoute } from '@tanstack/react-router';
import { AccountPage } from '../../components/pages/AccountPage';

export const Route = createFileRoute('/stores/new')({
  component: CreateNewStore
});

function CreateNewStore() {
  return <AccountPage mode="create" accountType="STORE" />;
}

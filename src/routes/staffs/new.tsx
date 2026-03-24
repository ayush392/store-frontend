import { createFileRoute } from '@tanstack/react-router';
import { AccountPage } from '../../components/pages/AccountPage';

export const Route = createFileRoute('/staffs/new')({
  component: CreateNewStaff
});

function CreateNewStaff() {
  return <AccountPage mode="create" accountType="STAFF" />;
}

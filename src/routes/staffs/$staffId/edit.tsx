import { createFileRoute } from '@tanstack/react-router';
import { AccountPage } from '../../../components/pages/AccountPage';

export const Route = createFileRoute('/staffs/$staffId/edit')({
  component: EditStaffProfile
});

function EditStaffProfile() {
  return <AccountPage mode="edit" accountType="STAFF" />;
}

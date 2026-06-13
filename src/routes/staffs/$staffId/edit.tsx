import { createFileRoute } from '@tanstack/react-router';
import { AccountPage } from '../../../components/pages/AccountPage';
import { parseObjectId } from '../../../shared/parser';

export const Route = createFileRoute('/staffs/$staffId/edit')({
  component: EditStaffProfile,
  params: {
    parse: (params) => ({
      staffId: parseObjectId(params.staffId)
    })
  }
});

function EditStaffProfile() {
  const { staffId } = Route.useParams();
  return <AccountPage mode="edit" accountType="STAFF" accountId={staffId} />;
}

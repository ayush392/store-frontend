import { createFileRoute } from '@tanstack/react-router';
import { AccountDetailPage } from '../../../components/pages/AccountDetailPage';

export const Route = createFileRoute('/staffs/$staffId/')({
  component: StaffDetailsPage
});

function StaffDetailsPage() {
  const { staffId } = Route.useParams();
  return <AccountDetailPage accountId={staffId} accountType="STAFF" basePath="staffs" />;
}

import { createFileRoute } from '@tanstack/react-router';
import { AccountPage } from '../../../components/pages/AccountPage';
import { parseObjectId } from '../../../shared/parser';

export const Route = createFileRoute('/stores/$storeId/edit')({
  component: EditStoreProfile,
  params: {
    parse: (params) => ({
      storeId: parseObjectId(params.storeId)
    })
  }
});

function EditStoreProfile() {
  const { storeId } = Route.useParams();
  return <AccountPage mode="edit" accountType="STORE" accountId={storeId} />;
}

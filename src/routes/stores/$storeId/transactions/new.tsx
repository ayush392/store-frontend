import { createFileRoute } from '@tanstack/react-router';
import { TransactionPage } from '../../../../components/pages/TransactionPage';
import { parseObjectId } from '../../../../shared/parser';

export const Route = createFileRoute('/stores/$storeId/transactions/new')({
  component: RouteComponent,
  params: {
    parse: (params) => ({
      storeId: parseObjectId(params.storeId)
    })
  }
});

function RouteComponent() {
  const { storeId } = Route.useParams();
  return <TransactionPage mode="create" accountId={storeId} />;
}

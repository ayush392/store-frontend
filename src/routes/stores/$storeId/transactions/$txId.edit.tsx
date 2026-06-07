import { createFileRoute } from '@tanstack/react-router';
import { TransactionPage } from '../../../../components/pages/TransactionPage';
import { parseObjectId } from '../../../../shared/parser';

export const Route = createFileRoute(
  '/stores/$storeId/transactions/$txId/edit'
)({
  component: RouteComponent,
  params: {
    parse: (params) => ({
      storeId: parseObjectId(params.storeId),
      txId: parseObjectId(params.txId)
    })
  }
});

function RouteComponent() {
  const { storeId, txId } = Route.useParams();
  return (
    <TransactionPage mode="edit" accountId={storeId} transactionId={txId} />
  );
}

import { createFileRoute } from '@tanstack/react-router';
import { TransactionPage } from '../../../../components/pages/TransactionPage';
import { parseObjectId } from '../../../../shared/parser';

export const Route = createFileRoute(
  '/customers/$customerId/transactions/$txId/edit'
)({
  component: RouteComponent,
  params: {
    parse: (params) => ({
      customerId: parseObjectId(params.customerId),
      txId: parseObjectId(params.txId)
    })
  }
});

function RouteComponent() {
  const { customerId } = Route.useParams();
  return <TransactionPage mode="edit" accountId={customerId} />;
}

import { createFileRoute } from '@tanstack/react-router';
import { TransactionPage } from '../../../../components/pages/TransactionPage';
import { parseObjectId } from '../../../../shared/parser';

export const Route = createFileRoute(
  '/staffs/$staffId/transactions/$txId/edit'
)({
  component: RouteComponent,
  params: {
    parse: (params) => ({
      staffId: parseObjectId(params.staffId),
      txId: parseObjectId(params.txId)
    })
  }
});

function RouteComponent() {
  const { staffId } = Route.useParams();
  return <TransactionPage mode="edit" accountId={staffId} />;
}

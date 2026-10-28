import { createFileRoute } from '@tanstack/react-router';
import { AccountListPage } from '../../components/pages/AccountListPage';

export const Route = createFileRoute('/stores/')({
  component: StoresPage
});

function StoresPage() {
  return <AccountListPage accountType="STORE" basePath="stores" />;
}

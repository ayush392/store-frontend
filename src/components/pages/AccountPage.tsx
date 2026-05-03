import { formatEnum } from '../../shared/format';
import type { AccountType } from '../../shared/schemas/account.schema';
import type { ObjectId } from '../../shared/schemas/common.schema';
import { AccountForm } from '../AccountForm';
import { PageLayout } from '../Layout';

type Props = {
  accountType: AccountType;
  mode: 'create' | 'edit';
  accountId?: ObjectId;
};

export function AccountPage({ accountType, mode }: Props) {
  const title =
    mode === 'edit' ? 'Edit Profile' : `Create new ${formatEnum(accountType)}`;

  if (mode === 'edit') {
    return (
      <PageLayout title={title}>
        <div className="text-2xl">Under Construction!</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={title}>
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 space-y-5">
        <AccountForm accountType={accountType} />
      </div>
    </PageLayout>
  );
}

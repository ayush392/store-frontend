import { Link } from '@tanstack/react-router';
import { accountDetailLink, newTransactionLink } from '../shared/accountLinks';
import { getBalanceDisplay } from '../shared/balance';
import type { Account } from '../shared/types';
import { buttonClass } from './buttonClass';

type Props = {
  account: Account;
};

// One row of the customer or store list. The whole row opens the account;
// Pay opens a new transaction for it.
export const AccountListItem = ({ account }: Props) => {
  const balance = getBalanceDisplay(
    account.accountType,
    account.currentOutstanding
  );

  return (
    <li className="flex items-stretch">
      <Link
        {...accountDetailLink(account.accountType, account._id)}
        className="flex min-w-0 flex-1 items-center gap-3 py-3 pl-4 pr-2 active:bg-surface-muted"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-fg">{account.name}</p>
          <p className="text-sm text-fg-secondary tabular-nums">
            {account.phone}
          </p>
          {account.address && (
            <p className="truncate text-sm text-fg-muted">{account.address}</p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs text-fg-secondary">{balance.label}</p>
          <p className={`font-semibold tabular-nums ${balance.className}`}>
            {balance.amount}
          </p>
        </div>
      </Link>

      <div className="flex shrink-0 items-center pr-4">
        <Link
          {...newTransactionLink(account.accountType, account._id)}
          aria-label={`Pay, ${account.name}`}
          className={buttonClass({ variant: 'secondary', className: 'px-3' })}
        >
          Pay
        </Link>
      </div>
    </li>
  );
};

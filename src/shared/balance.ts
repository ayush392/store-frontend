import { formatAmount } from './format';
import type { AccountType } from './schemas/account.schema';

export type BalanceDisplay = {
  label: string;
  amount: string;
  className: string;
};

// How an account's currentOutstanding is shown. The backend adds UDHAAR and
// ADVANCE to it and subtracts PAYMENT (store-backend/src/shared/constant.ts).
//
// Customers and stores (approved labels):
//   > 0  "To collect"        they owe you
//   < 0  "Advance received"  they paid more than they owed
//   = 0  "Settled"
// Staff keep the existing "Outstanding" label and signed amount until the
// staff labels are confirmed.
export const getBalanceDisplay = (
  accountType: AccountType,
  outstanding: number
): BalanceDisplay => {
  if (accountType === 'STAFF') {
    return {
      label: 'Outstanding',
      amount: formatAmount(outstanding),
      className: 'text-outstanding'
    };
  }

  if (outstanding > 0) {
    return {
      label: 'To collect',
      amount: formatAmount(outstanding),
      className: 'text-outstanding'
    };
  }

  if (outstanding < 0) {
    return {
      label: 'Advance received',
      amount: formatAmount(-outstanding),
      className: 'text-credit'
    };
  }

  return { label: 'Settled', amount: formatAmount(0), className: 'text-fg-muted' };
};

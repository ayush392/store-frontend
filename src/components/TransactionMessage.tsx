import { formatAmount } from '../shared/format';
import type { TransactionType } from '../shared/schemas/transaction.schema';

type Props = {
  amount: number;
  type: TransactionType | undefined;
  name: string;
};

// Colors follow the balance effect: UDHAAR/ADVANCE raise it (debit),
// PAYMENT lowers it (credit), SALARY doesn't change it (neutral).
const getMessageColor = (type: TransactionType) => {
  if (type === 'UDHAAR' || type === 'ADVANCE') {
    return 'border-debit/20 bg-debit-soft text-debit';
  }
  if (type === 'PAYMENT') {
    return 'border-credit/20 bg-credit-soft text-credit';
  }
  return 'border-line bg-surface-muted text-fg-secondary';
};

const getMessage = (type: TransactionType, amount: number, name: string) => {
  const amountText = formatAmount(amount);

  if (type === 'UDHAAR') {
    return `Udhaar: you gave ${amountText} to ${name}.`;
  }
  if (type === 'PAYMENT') {
    return `Payment: you got ${amountText} from ${name}.`;
  }
  if (type === 'SALARY') {
    return `Salary: you paid ${amountText} to ${name}.`;
  }
  if (type === 'ADVANCE') {
    return `Advance: you gave ${amountText} to ${name}.`;
  }

  return `Transaction of ${amountText} for ${name}.`;
};

export const TransactionMessage = ({ amount, type, name }: Props) => {
  if (!type) {
    return null;
  }
  return (
    <p
      aria-live="polite"
      className={`rounded-lg border px-3 py-2 font-medium ${getMessageColor(type)}`}
    >
      {getMessage(type, amount, name)}
    </p>
  );
};

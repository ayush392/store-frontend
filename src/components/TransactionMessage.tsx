import { formatAmount } from '../shared/format';
import type { TransactionType } from '../shared/schemas/transaction.schema';

type Props = {
  amount: number;
  type: TransactionType | undefined;
  name: string;
};

const getMessageColor = (type: TransactionType) => {
  if (type === 'UDHAAR' || type === 'ADVANCE') {
    return 'bg-rose-50 text-rose-700 ring-rose-100';
  }
  return 'bg-blue-50 text-blue-700 ring-blue-100';
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
    <div
      aria-live="polite"
      className={`rounded-xl px-3.5 py-3 text-sm font-semibold ring-1 ${getMessageColor(type)}`}
    >
      {getMessage(type, amount, name)}
    </div>
  );
};

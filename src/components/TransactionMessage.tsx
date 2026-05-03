import { formatAmount } from '../shared/format';
import type { TransactionType } from '../shared/schemas/transaction.schema';

type Props = {
  amount: number;
  type: TransactionType | undefined;
  name: string;
};

const getMessageColor = (type: TransactionType) => {
  if (type === 'UDHAAR' || type === 'ADVANCE') {
    return 'border-red-100 bg-red-50 text-red-800';
  }
  return 'border-blue-100 bg-blue-50 text-blue-800';
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
  if (!type || amount <= 0) {
    return null;
  }
  return (
    <div
      className={`rounded-lg border px-3 py-2 font-medium ${getMessageColor(type)}`}
    >
      {getMessage(type, amount, name)}
    </div>
  );
};

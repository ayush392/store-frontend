import type { TransactionType } from './schemas/transaction.schema';

export const formatEnum = (value: string) => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

export const formatAmount = (amount: number) => {
  const val = new Intl.NumberFormat('en-IN').format(amount);
  return `₹${val.split('.')[0]}`;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const getAmountColor = (type: TransactionType) => {
  if (type === 'UDHAAR' || type === 'ADVANCE') {
    return 'text-red-500';
  } else if (type === 'PAYMENT') {
    return 'text-blue-600';
  }
  return 'text-gray-600';
};

export const getAmountSymbol = (amount: number) => {
  if (amount < 0) return '+'; //amountChange<0 means substract that amt from customer.
  if (amount > 0) return '-';
  return '';
};

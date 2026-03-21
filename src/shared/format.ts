export const formatEnum = (value: string) => {
  if (!value) return '';
  return value.charAt(0) + value.slice(1).toLowerCase();
};

export const formatAmount = (amount: number) => {
  const val = new Intl.NumberFormat('en-IN').format(amount);
  return `₹${val.split('.')[0]}`;
};

import type { AccountType, TransactionType } from '@store/schemas';
import type { AnyFieldApi } from '@tanstack/react-form';

export interface FormInputProps {
  label: string;
  field: AnyFieldApi;
  disabled?: boolean;
  error?: string;
  classNames?: string;
}

export type Account = {
  _id: string;
  name: string;
  displayName: string;
  phone: string;
  accountType: AccountType;
  currentOutstanding: number;
  isActive: boolean;
};

export type RecentTrans = {
  _id: string;
  transactionType: TransactionType;
  amount: number;
  amountChange: number;
  date: string; // ISO date
  account: Account;
};
type Point = {
  date: string;
  credit: number;
  debit: number;
};

export type Chart = {
  totalDue: number;
  chartData: Point[];
};

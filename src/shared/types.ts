import type { AnyFieldApi } from '@tanstack/react-form';
import type { AccountType } from './schemas/account.schema';
import type { AttendanceType, SalaryType } from './schemas/staff.schema';
import type { TransactionType } from './schemas/transaction.schema';
import type { ObjectId } from './schemas/common.schema';
import type { UserRole } from './schemas/auth.schema';

export interface FormInputProps {
  label: string;
  field: AnyFieldApi;
  disabled?: boolean;
}

// GET /auth/me (the backend also sends isActive, which the app doesn't use).
export type Me = {
  name: string;
  phone: string;
  role: UserRole;
};

// A bill photo attached to a transaction (Cloudinary).
export type BillImage = { url: string; publicId: string };

export type Account = {
  _id: string;
  name: string;
  displayName: string;
  phone: string;
  address: string;
  accountType: AccountType;
  currentOutstanding: number;
  notes: string;
  isActive: boolean;
};

export type Employment = {
  _id: string;
  salary: number;
  salaryType: SalaryType;
  joinDate: string;
};

export type RecentTrans = {
  _id: string;
  transactionType: TransactionType;
  amount: number;
  amountChange: number;
  date: string; // ISO date
  account: Account;
  images?: BillImage[];
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

export type Staff = {
  employmentId: ObjectId;
  account: {
    _id: string;
    name: string;
    currentOutstanding: number;
    isActive: boolean;
  };
  salary: number;
  salaryType: SalaryType;
  status: AttendanceType;
};

export type Transactions = {
  _id: string;
  accountId: string;
  transactionType: TransactionType;
  amount: number;
  amountChange: number;
  date: string;
  note: string;
  images?: BillImage[];
};

export type UserDetails = {
  profile: Account;
  employment?: Employment[];
  transactions: Transactions[];
};

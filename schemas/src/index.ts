//Account
export * as Account from './account.schema.js';
export type {
  AccountType,
  CreateAccount,
  UpdateAccount,
  UpdateOutstanding
} from './account.schema.js';

//Auth
export * as Auth from './auth.schema.js';
export type { LoginUser, RegisterUser, UserRole } from './auth.schema.js';

// Common
export * as Common from './common.schema.js';
export type { DateOnly, DateTime, ObjectId } from './common.schema.js';

//Staff
export * as Staff from './staff.schema.js';
export type {
  Attendance,
  AttendanceQuery,
  AttendanceType,
  BulkAttendance,
  CreateEmployment,
  CreateStaff,
  DeleteEmployment,
  SalaryType
} from './staff.schema.js';

//Transaction
export * as Transaction from './transaction.schema.js';
export type {
  CreateTransaction,
  TransactionType,
  UpdateTransaction
} from './transaction.schema.js';

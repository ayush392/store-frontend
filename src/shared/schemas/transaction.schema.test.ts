import { describe, expect, it } from 'vitest';
import {
  getTransactionTypeOptions,
  STAFF_ONLY_TRANSACTION_TYPES,
  TransactionTypeEnum
} from './transaction.schema';

// The backend rejects SALARY and ADVANCE for customers and stores
// (store-backend/src/features/transactions/transaction.service.ts).
describe('getTransactionTypeOptions', () => {
  it('offers only UDHAAR and PAYMENT for customers', () => {
    expect(getTransactionTypeOptions('CUSTOMER')).toEqual(['UDHAAR', 'PAYMENT']);
  });

  it('offers only UDHAAR and PAYMENT for stores', () => {
    expect(getTransactionTypeOptions('STORE')).toEqual(['UDHAAR', 'PAYMENT']);
  });

  it('offers every type for staff', () => {
    expect(getTransactionTypeOptions('STAFF')).toEqual([
      ...TransactionTypeEnum.options
    ]);
  });

  it('keeps UDHAAR as the first (default) option for every account type', () => {
    expect(getTransactionTypeOptions('CUSTOMER')[0]).toBe('UDHAAR');
    expect(getTransactionTypeOptions('STORE')[0]).toBe('UDHAAR');
    expect(getTransactionTypeOptions('STAFF')[0]).toBe('UDHAAR');
  });

  it('lists SALARY and ADVANCE as the staff-only types', () => {
    expect([...STAFF_ONLY_TRANSACTION_TYPES].sort()).toEqual([
      'ADVANCE',
      'SALARY'
    ]);
  });
});

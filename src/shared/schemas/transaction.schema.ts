import { z } from 'zod';
import type { AccountType } from './account.schema';
import { DateOnlySchema } from './common.schema.js';

export const TransactionTypeEnum = z.enum([
  'UDHAAR',
  'PAYMENT',
  'SALARY',
  'ADVANCE'
]);

export const CreateTransactionSchema = z.object({
  transactionType: TransactionTypeEnum,
  amount: z
    .int('Amount should be integer')
    .positive('Amount must be greater than 0'),
  date: DateOnlySchema,
  note: z.string().trim().min(1, 'Notes is required'),
  images: z
    .array(
      z.object({
        publicId: z.string(),
        url: z.string()
      })
    )
    .optional()
});

export const UpdateTransactionSchema = CreateTransactionSchema.omit({
  transactionType: true
})
  .partial()
  .extend({
    reason: z.string().trim().min(1, 'Reason is required')
  });

export type TransactionType = z.infer<typeof TransactionTypeEnum>;

// Mirrors STAFF_ONLY_TRANSACTION_TYPES in store-backend/src/shared/constant.ts.
// The backend rejects these types for CUSTOMER and STORE accounts.
export const STAFF_ONLY_TRANSACTION_TYPES: readonly TransactionType[] = [
  TransactionTypeEnum.enum.SALARY,
  TransactionTypeEnum.enum.ADVANCE
];

export const getTransactionTypeOptions = (
  accountType: AccountType
): TransactionType[] =>
  accountType === 'STAFF'
    ? [...TransactionTypeEnum.options]
    : TransactionTypeEnum.options.filter(
        (type) => !STAFF_ONLY_TRANSACTION_TYPES.includes(type)
      );
export type CreateTransaction = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>;

import { z } from 'zod';
import { DateOnlySchema, ObjectIdSchema } from './common.schema.js';

export const TransactionTypeEnum = z.enum([
  'UDHAAR',
  'PAYMENT',
  'SALARY',
  'ADVANCE'
]);

export const CreateTransactionSchema = z.object({
  accountId: ObjectIdSchema,
  transactionType: TransactionTypeEnum,
  amount: z
    .int('Amount should be integer')
    .positive('Amount must be greater than 0'),
  date: DateOnlySchema,
  note: z.string().trim().default('')
});

export const UpdateTransactionSchema = CreateTransactionSchema.omit({
  accountId: true,
  transactionType: true
})
  .partial()
  .extend({
    reason: z.string().optional()
  });

export type TransactionType = z.infer<typeof TransactionTypeEnum>;
export type CreateTransaction = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>;

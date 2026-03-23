import { z } from 'zod';
import { TransactionTypeEnum } from './transaction.schema.js';

const DateFormSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format should be YYYY-MM-DD')
  .refine(
    (d) => !Number.isNaN(new Date(`${d}T00:00:00+05:30`).getTime()),
    'Invalid calendar date'
  );

export const CreateTransactionSchema = z.object({
  transactionType: TransactionTypeEnum,
  amount: z
    .int('Amount should be integer')
    .positive('Amount must be greater than 0'),
  date: DateFormSchema,
  note: z.string().trim()
});

export const UpdateTransactionSchema = CreateTransactionSchema.omit({
  transactionType: true
}).extend({
  reason: z.string().trim()
});

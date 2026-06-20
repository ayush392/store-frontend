import { z } from 'zod';
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
export type CreateTransaction = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>;

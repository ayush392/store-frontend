import { z } from 'zod';
import { ObjectIdSchema, PhoneSchema } from './common.schema.js';

export const AccountTypeEnum = z.enum(['CUSTOMER', 'STORE', 'STAFF']);

export const BaseAccountSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters long'),
  displayName: z.string().trim().default(''),
  phone: PhoneSchema,
  address: z
    .string()
    .trim()
    .min(5, 'Address must be at least 5 characters long'),
  notes: z.string().trim().default('')
});

export const CreateAccountSchema = BaseAccountSchema.extend({
  accountType: AccountTypeEnum.exclude(['STAFF'])
});

export const UpdateAccountSchema = BaseAccountSchema.partial();

export const UpdateOutstandingSchema = z.object({
  accountId: ObjectIdSchema,
  diffAmount: z.number()
});

export const AccountQuerySchema = z.object({
  accountType: AccountTypeEnum.exclude(['STAFF'])
});

export type AccountType = z.infer<typeof AccountTypeEnum>;
export type AccountQuery = z.infer<typeof AccountQuerySchema>;
export type CreateAccount = z.infer<typeof CreateAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;
export type UpdateOutstanding = z.infer<typeof UpdateOutstandingSchema>;

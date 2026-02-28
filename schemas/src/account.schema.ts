import { z } from 'zod';
import { ObjectIdSchema } from './common.schema.js';

export const AccountTypeEnum = z.enum(['CUSTOMER', 'STORE', 'STAFF']);

export const BaseAccountSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  displayName: z.string().optional().default(''),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid mobile number'),
  address: z.string().min(5, 'Address must be at least 5 characters long'),
  notes: z.string().optional()
});

export const CreateAccountSchema = BaseAccountSchema.extend({
  accountType: AccountTypeEnum.exclude(['STAFF'])
});

export const UpdateAccountSchema = BaseAccountSchema.partial();

export const UpdateOutstandingSchema = z.object({
  accountId: ObjectIdSchema,
  diffAmount: z.number()
});

export type AccountType = z.infer<typeof AccountTypeEnum>;
export type CreateAccount = z.infer<typeof CreateAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;
export type UpdateOutstanding = z.infer<typeof UpdateOutstandingSchema>;

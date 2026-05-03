import { z } from 'zod';
import { PhoneSchema } from './common.schema';

export const AccountTypeEnum = z.enum(['CUSTOMER', 'STORE', 'STAFF']);

export const BaseAccountSchema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters long'),
  displayName: z.string().trim(),
  phone: PhoneSchema,
  address: z.string().trim().min(5, 'Address is too short'),
  notes: z.string().trim()
});

export const CreateAccountSchema = BaseAccountSchema.extend({
  accountType: AccountTypeEnum.exclude(['STAFF'])
});

export const UpdateAccountSchema = BaseAccountSchema.partial();

export type AccountType = z.infer<typeof AccountTypeEnum>;
export type CreateAccount = z.infer<typeof CreateAccountSchema>;
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>;

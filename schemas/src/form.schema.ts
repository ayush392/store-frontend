import { z } from 'zod';
import { AccountTypeEnum, BaseAccountSchema } from './account.schema.js';
import { SalaryTypeEnum } from './staff.schema.js';
import { CreateTransactionSchema as CreateTransSchema } from './transaction.schema.js';

const DateFormSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format should be YYYY-MM-DD')
  .refine(
    (d) => !Number.isNaN(new Date(`${d}T00:00:00+05:30`).getTime()),
    'Invalid calendar date'
  );

export const CreateTransactionSchema = CreateTransSchema.omit({
  accountId: true
}).extend({
  date: DateFormSchema,
  note: z.string().trim()
});

export const UpdateTransactionSchema = CreateTransactionSchema.omit({
  transactionType: true
}).extend({
  reason: z.string().trim()
});

export const CreateAccountSchema = BaseAccountSchema.extend({
  displayName: z.string().trim(),
  notes: z.string().trim(),
  accountType: AccountTypeEnum.exclude(['STAFF'])
});

export const CreateStaffSchema = CreateAccountSchema.omit({
  accountType: true
}).extend({
  employment: z.object({
    salaryType: SalaryTypeEnum,
    joinDate: DateFormSchema,
    salary: z
      .int('Amount should be integer')
      .positive('Amount must be greater than 0')
  })
});

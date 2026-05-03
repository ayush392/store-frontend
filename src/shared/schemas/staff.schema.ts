import { z } from 'zod';
import { BaseAccountSchema } from './account.schema.js';
import { DateOnlySchema, ObjectIdSchema } from './common.schema.js';

export const AttendanceStatusEnum = z.enum(['PRESENT', 'ABSENT', 'HALF']);
export const SalaryTypeEnum = z.enum(['DAILY', 'MONTHLY']);

export const BaseEmploymentSchema = z.object({
  salaryType: SalaryTypeEnum,
  joinDate: DateOnlySchema,
  salary: z
    .int('Amount should be integer')
    .positive('Amount must be greater than 0')
});

export const CreateStaffSchema = BaseAccountSchema.extend({
  employment: BaseEmploymentSchema
});

export const CreateEmploymentSchema = BaseEmploymentSchema;

export const AttendanceSchema = z.object({
  accountId: ObjectIdSchema,
  employmentId: ObjectIdSchema,
  date: DateOnlySchema,
  status: AttendanceStatusEnum
});

export const BulkAttendanceSchema = z
  .array(AttendanceSchema.omit({ date: true }))
  .min(1);

// TypeScript types
export type SalaryType = z.infer<typeof SalaryTypeEnum>;
export type AttendanceType = z.infer<typeof AttendanceStatusEnum>;
export type CreateEmployment = z.infer<typeof CreateEmploymentSchema>;
export type CreateStaff = z.infer<typeof CreateStaffSchema>;
export type Attendance = z.infer<typeof AttendanceSchema>;
export type BulkAttendance = z.infer<typeof BulkAttendanceSchema>;

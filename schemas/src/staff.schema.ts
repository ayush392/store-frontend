import { z } from 'zod';
import { BaseAccountSchema } from './account.schema.js';
import { DateOnlySchema, ObjectIdSchema } from './common.schema.js';

export const AttendanceStatusEnum = z.enum(['PRESENT', 'ABSENT', 'HALF']);
export const SalaryTypeEnum = z.enum(['DAILY', 'MONTHLY']);

// Daily employment
const DailyEmploymentSchema = z.object({
  salaryType: z.literal(SalaryTypeEnum.enum.DAILY),
  joinDate: DateOnlySchema,
  salary: z
    .number()
    .int('Salary must be a whole number')
    .min(100, 'Minimum Daily Salary must be 100')
    .max(1000, 'Maximum Daily Salary must be 1,000')
});

// Monthly employment
const MonthlyEmploymentSchema = z.object({
  salaryType: z.literal(SalaryTypeEnum.enum.MONTHLY),
  joinDate: DateOnlySchema,
  salary: z
    .number()
    .int('Salary must be a whole number')
    .min(3000, 'Minimum Monthly Salary must be 3,000')
    .max(30000, 'Maximum Monthly Salary must be 30,000')
});

// Discriminated union
export const BaseEmploymentSchema = z.discriminatedUnion('salaryType', [
  DailyEmploymentSchema,
  MonthlyEmploymentSchema
]);

export const CreateStaffSchema = BaseAccountSchema.extend({
  employment: BaseEmploymentSchema
});

export const CreateEmploymentSchema = BaseEmploymentSchema;

export const DeleteEmploymentSchema = z.object({
  leaveDate: DateOnlySchema
});

export const AttendanceSchema = z.object({
  accountId: ObjectIdSchema,
  employmentId: ObjectIdSchema,
  date: DateOnlySchema,
  status: AttendanceStatusEnum
});

export const BulkAttendanceSchema = z
  .array(AttendanceSchema.omit({ date: true }))
  .min(1);

export const AttendanceQuerySchema = z.object({
  employmentId: ObjectIdSchema.optional(),
  month: z
    .string()
    .regex(/^\d{1,2}$/, 'Month must be a number')
    .transform(Number)
    .refine((m) => m >= 1 && m <= 12, 'Month must be between 1 and 12'),
  year: z
    .string()
    .regex(/^\d{4}$/, 'Year must be 4 digits')
    .transform(Number)
    .refine((y) => y >= 2020 && y <= 2100, 'Year out of range')
});

// TypeScript types
export type SalaryType = z.infer<typeof SalaryTypeEnum>;
export type AttendanceType = z.infer<typeof AttendanceStatusEnum>;
export type CreateEmployment = z.infer<typeof CreateEmploymentSchema>;
export type DeleteEmployment = z.infer<typeof DeleteEmploymentSchema>;
export type CreateStaff = z.infer<typeof CreateStaffSchema>;
export type Attendance = z.infer<typeof AttendanceSchema>;
export type BulkAttendance = z.infer<typeof BulkAttendanceSchema>;
export type AttendanceQuery = z.infer<typeof AttendanceQuerySchema>;

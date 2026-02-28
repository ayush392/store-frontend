import { z } from 'zod';
import { PhoneSchema } from './common.schema.js';

export const UserRoleEnum = z.enum(['ADMIN', 'OWNER', 'STAFF', 'USER']);

export const LoginUserSchema = z.object({
  phone: PhoneSchema,
  password: z.string().min(1, 'password is required')
});

export const RegisterUserSchema = LoginUserSchema.extend({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  password: z.string().min(8, 'Password must be at least 8 characters long')
});

export type UserRole = z.infer<typeof UserRoleEnum>;
export type LoginUser = z.infer<typeof LoginUserSchema>;
export type RegisterUser = z.infer<typeof RegisterUserSchema>;

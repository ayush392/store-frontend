import { z } from 'zod';

//NOTE: this file contains the validation schemas which are used across the app
export const REGEX = {
  id: /^[a-fA-F0-9]{24}$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
  phone: /^[6-9]\d{9}$/
};

export const ObjectIdSchema = z
  .string('id is not valid or undefined')
  .trim()
  .regex(REGEX.id, 'Invalid id');

export const DateOnlySchema = z
  .string()
  .trim()
  .regex(REGEX.date, 'Date format should be YYYY-MM-DD');

export const PhoneSchema = z
  .string()
  .trim()
  .regex(REGEX.phone, 'Please enter a valid mobile number');

export type ObjectId = z.infer<typeof ObjectIdSchema>;
export type DateOnly = z.infer<typeof DateOnlySchema>;
export type Phone = z.infer<typeof PhoneSchema>;

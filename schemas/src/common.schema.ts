import { z } from 'zod';

//NOTE: this file contains the validation schemas which are used across the app

const objectIdRegex = /^[a-fA-F0-9]{24}$/;
export const ObjectIdSchema = z
  .string()
  .trim()
  .regex(objectIdRegex, 'Invalid ObjectId format');

export const DateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format should be YYYY-MM-DD')
  .refine(
    (d) => !Number.isNaN(new Date(`${d}T00:00:00+05:30`).getTime()),
    'Invalid calendar date'
  )
  .transform((d) => new Date(`${d}T00:00:00+05:30`));

export const DateTimeSchema = z
  .union([z.iso.datetime({ offset: true }), z.date()])
  .transform((d) => new Date(d));

export type ObjectId = z.infer<typeof ObjectIdSchema>;
export type DateOnly = z.infer<typeof DateOnlySchema>;
export type DateTime = z.infer<typeof DateTimeSchema>;

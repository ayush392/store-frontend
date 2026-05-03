import { z } from 'zod';
import { ObjectIdSchema } from './schemas/common.schema';

export const parseObjectId = (value: string): string => {
  const result = z.safeParse(ObjectIdSchema, value);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => issue.message)
      .join(', ');
    throw new Error(message);
  }

  return result.data;
};

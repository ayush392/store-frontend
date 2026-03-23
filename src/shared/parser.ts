import { Common } from '@store/schemas';

export const parseObjectId = (value: string): string => {
  if (!Common.objectIdRegex.test(value)) {
    throw new Error('Invalid ObjectId');
  }
  return value;
};

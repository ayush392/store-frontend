// Returns the fields whose value differs from the form's default values.
// Only keys present in `defaults` are compared, matching the previous
// inline logic in AccountForm and TransactionForm.
export const getChangedFields = <T extends object>(
  values: T,
  defaults: Partial<T>
): Partial<T> => {
  const changed: Partial<T> = {};

  for (const key of Object.keys(defaults) as Array<keyof T>) {
    if (values[key] !== defaults[key]) {
      changed[key] = values[key];
    }
  }

  return changed;
};

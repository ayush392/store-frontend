import type { AnyFieldApi } from '@tanstack/react-form';

/** Resolves id, error and aria attributes the same way for every input. */
export const getFieldProps = (field: AnyFieldApi, error?: string) => {
  const { isTouched, errors } = field.state.meta;
  const resolvedError: string | undefined =
    error ?? (isTouched && errors.length > 0 ? errors[0]?.message : undefined);
  const id = `field-${field.name.replace(/\W+/g, '-')}`;

  return {
    id,
    error: resolvedError || undefined,
    ariaProps: {
      'aria-invalid': resolvedError ? true : undefined,
      'aria-describedby': resolvedError ? `${id}-error` : undefined
    }
  };
};

export const inputClass = (error?: string, extra = '') =>
  `input ${error ? 'input-error' : ''} ${extra}`.trim();

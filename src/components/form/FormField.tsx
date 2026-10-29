import { useId, type ReactNode } from 'react';
import type { AnyFieldApi } from '@tanstack/react-form';

export type ControlProps = {
  id: string;
  className: string;
  'aria-invalid': true | undefined;
  'aria-describedby': string | undefined;
};

type Props = {
  label: string;
  field: AnyFieldApi;
  error?: string;
  children: (control: ControlProps) => ReactNode;
};

// Base classes shared by every form control. 16px text (text-base) stops iOS
// from zooming in when the control is focused; h-11 gives a 44px target.
const controlBase =
  'block w-full rounded-lg border bg-surface px-3 text-base text-fg ' +
  'placeholder:text-fg-muted outline-offset-0 ' +
  'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60';

// Shared label, error message and accessibility wiring for form inputs.
export const FormField = ({ label, field, error, children }: Props) => {
  const id = useId();
  const errorId = `${id}-error`;
  const { isTouched, errors } = field.state.meta;
  const message =
    error ?? (isTouched && errors.length > 0 ? errors[0]?.message : '');

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-fg-secondary"
      >
        {label}
      </label>
      {children({
        id,
        className: `${controlBase} ${message ? 'border-error' : 'border-line-strong'}`,
        'aria-invalid': message ? true : undefined,
        'aria-describedby': message ? errorId : undefined
      })}
      {message && (
        <p id={errorId} className="mt-1 text-sm text-error">
          {message}
        </p>
      )}
    </div>
  );
};

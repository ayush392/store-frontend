import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import type { FormInputProps } from '../../shared/types';
import { FormField } from './FormField';

interface PasswordInputProps extends FormInputProps {
  placeholder: string;
}

export const PasswordInput = ({
  label,
  field,
  placeholder,
  disabled = false
}: PasswordInputProps) => {
  const [show, setShow] = useState(false);

  return (
    <FormField label={label} field={field}>
      {(control) => (
        <div className="relative">
          <input
            {...control}
            className={`${control.className} h-11 pr-11`}
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            value={String(field.state.value ?? '')}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            disabled={disabled}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? 'Hide password' : 'Show password'}
            aria-pressed={show}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-fg-secondary active:text-fg"
          >
            {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>
      )}
    </FormField>
  );
};

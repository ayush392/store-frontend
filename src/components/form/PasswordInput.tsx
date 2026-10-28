import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import type { FormInputProps } from '../../shared/types';
import { FormField } from './FormField';
import { getFieldProps, inputClass } from './fieldUtils';

interface PasswordInputProps extends FormInputProps {
  placeholder: string;
}

export const PasswordInput = ({
  label,
  field,
  placeholder,
  disabled = false,
  error
}: PasswordInputProps) => {
  const [show, setShow] = useState(false);
  const { id, error: resolvedError, ariaProps } = getFieldProps(field, error);

  return (
    <FormField label={label} htmlFor={id} error={resolvedError}>
      <div className="relative">
        <input
          id={id}
          name={field.name}
          type={show ? 'text' : 'password'}
          autoComplete="current-password"
          enterKeyHint="go"
          value={String(field.state.value ?? '')}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClass(resolvedError, 'pr-12')}
          {...ariaProps}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="icon-btn absolute top-1/2 right-1 -translate-y-1/2 text-slate-400"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      </div>
    </FormField>
  );
};

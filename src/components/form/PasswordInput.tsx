import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import type { FormInputProps } from '../../shared/types';

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
  const { isTouched, errors } = field.state.meta;
  const resolvedValue = String(field.state.value ?? '');
  const resolvedError =
    error ?? (isTouched && errors.length > 0 ? errors[0]?.message : '');

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={resolvedValue}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full border px-3 py-2 rounded-lg text-sm ${
            disabled ? 'bg-gray-100' : 'border-gray-300'
          } ${resolvedError ? 'border-red-500' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      </div>
      {resolvedError && (
        <p className="text-red-500 text-xs mt-1">{resolvedError}</p>
      )}
    </div>
  );
};

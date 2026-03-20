import { useEffect, useState } from 'react';
import type { FormInputProps } from '../../shared/types';

interface NumberInputProps extends FormInputProps {
  placeholder: string;
}

export const NumberInput = ({
  label,
  field,
  placeholder,
  disabled = false,
  error
}: NumberInputProps) => {
  const { isTouched, errors } = field.state.meta;
  const resolvedValue = Number(field.state.value ?? 0);
  const [internalValue, setInternalValue] = useState(String(resolvedValue));
  const resolvedError =
    error ?? (isTouched && errors.length > 0 ? errors[0] : '');

  // Keeps typing fluid while still syncing with form-level resets/updates.
  useEffect(() => {
    setInternalValue(String(resolvedValue));
  }, [resolvedValue]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type="number"
        value={internalValue}
        onChange={(e) => {
          const nextValue = e.target.value.replace(/^0+(?=\d)/, '');
          setInternalValue(nextValue);
          if (nextValue !== '') {
            field.handleChange(Number(nextValue));
          }
        }}
        onBlur={() => {
          if (internalValue === '') {
            field.handleChange(0);
            setInternalValue('0');
          }
          field.handleBlur();
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border rounded-lg px-3 py-2 text-sm ${
          disabled ? 'bg-gray-100' : 'border-gray-300'
        } ${resolvedError ? 'border-red-500' : ''}`}
        min={0}
      />
      {resolvedError && (
        <p className="text-red-500 text-xs mt-1">{resolvedError}</p>
      )}
    </div>
  );
};

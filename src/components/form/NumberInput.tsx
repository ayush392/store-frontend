import { useState } from 'react';
import type { FormInputProps } from '../../shared/types';
import { FormField } from './FormField';
import { getFieldProps, inputClass } from './fieldUtils';

interface NumberInputProps extends FormInputProps {
  placeholder?: string;
  /** Shown inside the input on the left, e.g. "₹" */
  prefix?: string;
}

export const NumberInput = ({
  label,
  field,
  placeholder = '0',
  disabled = false,
  error,
  prefix
}: NumberInputProps) => {
  const { id, error: resolvedError, ariaProps } = getFieldProps(field, error);
  const resolvedValue = Number(field.state.value ?? 0);

  // Keep a string copy so the user can clear the field while typing.
  // Synced during render (not in an effect) to avoid cascading renders.
  const [prevResolvedValue, setPrevResolvedValue] = useState(resolvedValue);
  const [internalValue, setInternalValue] = useState(resolvedValue ? String(resolvedValue) : '');

  if (prevResolvedValue !== resolvedValue) {
    setPrevResolvedValue(resolvedValue);
    setInternalValue(resolvedValue ? String(resolvedValue) : '');
  }

  return (
    <FormField label={label} htmlFor={id} error={resolvedError}>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-base font-semibold text-slate-400">
            {prefix}
          </span>
        )}
        <input
          id={id}
          name={field.name}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          enterKeyHint="next"
          value={internalValue}
          onChange={(e) => {
            // Digits only; strip leading zeros
            const nextValue = e.target.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
            setInternalValue(nextValue);
            field.handleChange(nextValue === '' ? 0 : Number(nextValue));
          }}
          onBlur={field.handleBlur}
          onFocus={(e) => e.target.select()}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClass(resolvedError, `tabular-nums font-semibold ${prefix ? 'pl-8' : ''}`)}
          {...ariaProps}
        />
      </div>
    </FormField>
  );
};

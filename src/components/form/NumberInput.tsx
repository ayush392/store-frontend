import { useState } from 'react';
import type { FormInputProps } from '../../shared/types';
import { FormField } from './FormField';

type NumberInputProps = FormInputProps;

export const NumberInput = ({
  label,
  field,
  disabled = false
}: NumberInputProps) => {
  const resolvedValue = Number(field.state.value ?? 0);
  const [internalValue, setInternalValue] = useState(String(resolvedValue));
  const [syncedValue, setSyncedValue] = useState(resolvedValue);

  // Keeps typing fluid (an empty field stays empty) while still following
  // form-level resets/updates. Adjusting state during render replaces the
  // previous effect, which caused an extra render pass.
  if (resolvedValue !== syncedValue) {
    setSyncedValue(resolvedValue);
    setInternalValue(String(resolvedValue));
  }

  return (
    <FormField label={label} field={field}>
      {(control) => (
        <input
          {...control}
          className={`${control.className} h-11 tabular-nums`}
          type="number"
          inputMode="numeric"
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
          disabled={disabled}
          min={0}
        />
      )}
    </FormField>
  );
};

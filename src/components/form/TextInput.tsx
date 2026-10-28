import type { ReactNode } from 'react';
import type { FormInputProps } from '../../shared/types';
import { FormField } from './FormField';
import { getFieldProps, inputClass } from './fieldUtils';

interface TextInputProps extends FormInputProps {
  placeholder: string;
  type?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'url' | 'numeric' | 'search';
  autoComplete?: string;
  headerAction?: ReactNode;
  rightElement?: ReactNode;
}

export const TextInput = ({
  label,
  field,
  placeholder,
  disabled = false,
  error,
  type = 'text',
  inputMode,
  autoComplete,
  headerAction,
  rightElement
}: TextInputProps) => {
  const { id, error: resolvedError, ariaProps } = getFieldProps(field, error);
  const lowerLabel = label.toLowerCase();

  // Detect input mode from label if not explicitly passed
  const resolvedInputMode =
    inputMode ||
    (lowerLabel.includes('phone') ? 'tel' : lowerLabel.includes('email') ? 'email' : 'text');

  return (
    <FormField label={label} htmlFor={id} error={resolvedError} headerAction={headerAction}>
      <div className="relative">
        <input
          id={id}
          name={field.name}
          type={type}
          inputMode={resolvedInputMode}
          autoComplete={autoComplete}
          enterKeyHint="next"
          value={String(field.state.value ?? '')}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={inputClass(resolvedError, rightElement ? 'pr-12' : '')}
          {...ariaProps}
        />
        {rightElement && (
          <div className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center">
            {rightElement}
          </div>
        )}
      </div>
    </FormField>
  );
};

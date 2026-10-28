import type { FormInputProps } from '../../shared/types';
import { FormField } from './FormField';
import { getFieldProps, inputClass } from './fieldUtils';

interface TextAreaProps extends FormInputProps {
  rows?: number;
  placeholder: string;
}

export const TextArea = ({
  label,
  field,
  rows = 3,
  placeholder,
  disabled = false,
  error
}: TextAreaProps) => {
  const { id, error: resolvedError, ariaProps } = getFieldProps(field, error);

  return (
    <FormField label={label} htmlFor={id} error={resolvedError}>
      <textarea
        id={id}
        name={field.name}
        value={String(field.state.value ?? '')}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={inputClass(resolvedError, 'block resize-none')}
        {...ariaProps}
      />
    </FormField>
  );
};

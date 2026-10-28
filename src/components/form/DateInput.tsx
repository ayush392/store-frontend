import type { FormInputProps } from '../../shared/types';
import { FormField } from './FormField';
import { getFieldProps, inputClass } from './fieldUtils';

interface DateInputProps extends FormInputProps {
  inputType?: 'date' | 'datetime-local';
}

export const DateInput = ({
  label,
  field,
  inputType = 'date',
  disabled = false,
  error
}: DateInputProps) => {
  const { id, error: resolvedError, ariaProps } = getFieldProps(field, error);

  return (
    <FormField label={label} htmlFor={id} error={resolvedError}>
      <input
        id={id}
        name={field.name}
        type={inputType}
        value={String(field.state.value ?? '')}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        disabled={disabled}
        // iOS renders date inputs centered and shorter without these
        className={inputClass(resolvedError, 'text-left [&::-webkit-date-and-time-value]:text-left')}
        {...ariaProps}
      />
    </FormField>
  );
};

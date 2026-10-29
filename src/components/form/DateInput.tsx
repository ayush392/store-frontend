import type { FormInputProps } from '../../shared/types';
import { FormField } from './FormField';

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
  return (
    <FormField label={label} field={field} error={error}>
      {(control) => (
        <input
          {...control}
          className={`${control.className} h-11`}
          type={inputType}
          value={String(field.state.value ?? '')}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          disabled={disabled}
        />
      )}
    </FormField>
  );
};

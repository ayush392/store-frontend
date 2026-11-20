import type { FormInputProps } from '../../shared/types';
import { FormField } from './FormField';

type DateInputProps = FormInputProps;

export const DateInput = ({
  label,
  field,
  disabled = false
}: DateInputProps) => {
  return (
    <FormField label={label} field={field}>
      {(control) => (
        <input
          {...control}
          className={`${control.className} h-11`}
          type="date"
          value={String(field.state.value ?? '')}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          disabled={disabled}
        />
      )}
    </FormField>
  );
};

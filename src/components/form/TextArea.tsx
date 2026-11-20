import type { FormInputProps } from '../../shared/types';
import { FormField } from './FormField';

interface TextAreaProps extends FormInputProps {
  rows?: number;
  placeholder: string;
}

export const TextArea = ({
  label,
  field,
  rows = 3,
  placeholder,
  disabled = false
}: TextAreaProps) => {
  return (
    <FormField label={label} field={field}>
      {(control) => (
        <textarea
          {...control}
          className={`${control.className} py-2.5`}
          value={String(field.state.value ?? '')}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
    </FormField>
  );
};

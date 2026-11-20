import type { FormInputProps } from '../../shared/types';
import { FormField } from './FormField';

interface TextInputProps extends FormInputProps {
  placeholder: string;
  type?: 'text' | 'tel';
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
}

export const TextInput = ({
  label,
  field,
  placeholder,
  disabled = false,
  type = 'text',
  inputMode,
  autoComplete
}: TextInputProps) => {
  return (
    <FormField label={label} field={field}>
      {(control) => (
        <input
          {...control}
          className={`${control.className} h-11`}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={String(field.state.value ?? '')}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
    </FormField>
  );
};

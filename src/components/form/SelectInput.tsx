import { FiChevronDown } from 'react-icons/fi';
import type { FormInputProps } from '../../shared/types';
import { FormField } from './FormField';

interface SelectInputProps extends FormInputProps {
  options: string[];
}

export const SelectInput = ({
  label,
  field,
  options,
  disabled = false
}: SelectInputProps) => {
  return (
    <FormField label={label} field={field}>
      {(control) => (
        <div className="relative">
          <select
            {...control}
            className={`${control.className} h-11 appearance-none pr-9`}
            value={String(field.state.value ?? '')}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            disabled={disabled}
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <FiChevronDown className="text-fg-muted" aria-hidden="true" />
          </div>
        </div>
      )}
    </FormField>
  );
};

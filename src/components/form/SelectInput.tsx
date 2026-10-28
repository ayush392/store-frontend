import { FiChevronDown } from 'react-icons/fi';
import { formatEnum } from '../../shared/format';
import type { FormInputProps } from '../../shared/types';
import { FormField } from './FormField';
import { getFieldProps, inputClass } from './fieldUtils';

interface SelectInputProps extends FormInputProps {
  options: readonly string[];
  includeEmptyOption?: boolean;
  emptyOptionLabel?: string;
}

export const SelectInput = ({
  label,
  field,
  options,
  includeEmptyOption = false,
  emptyOptionLabel = 'Select…',
  disabled = false,
  error
}: SelectInputProps) => {
  const { id, error: resolvedError, ariaProps } = getFieldProps(field, error);

  return (
    <FormField label={label} htmlFor={id} error={resolvedError}>
      <div className="relative">
        <select
          id={id}
          name={field.name}
          value={String(field.state.value ?? '')}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          disabled={disabled}
          className={inputClass(resolvedError, 'pr-10')}
          {...ariaProps}
        >
          {includeEmptyOption && <option value="">{emptyOptionLabel}</option>}
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {formatEnum(opt)}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
          <FiChevronDown size={18} />
        </div>
      </div>
    </FormField>
  );
};

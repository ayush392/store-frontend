import { FiChevronDown } from 'react-icons/fi';
import type { FormInputProps } from '../../shared/types';

interface SelectInputProps extends FormInputProps {
  options: string[];
  includeEmptyOption?: boolean;
  emptyOptionLabel?: string;
}

export const SelectInput = ({
  label,
  field,
  options,
  includeEmptyOption = false,
  emptyOptionLabel = '--Select--',
  disabled = false,
  error
}: SelectInputProps) => {
  const { isTouched, errors } = field.state.meta;
  const resolvedValue = String(field.state.value ?? '');
  const resolvedError =
    error ?? (isTouched && errors.length > 0 ? errors[0]?.message : '');

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          value={resolvedValue}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          disabled={disabled}
          className={`appearance-none pr-8 w-full border px-3 py-2 rounded-lg text-sm ${
            disabled ? 'bg-gray-100' : 'border-gray-300'
          } ${resolvedError ? 'border-red-500' : ''}`}
        >
          {includeEmptyOption ? (
            <option value="">{emptyOptionLabel}</option>
          ) : null}
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <FiChevronDown className=" text-gray-400" />
        </div>
      </div>
      {resolvedError && (
        <p className="text-red-500 text-xs mt-1">{resolvedError}</p>
      )}
    </div>
  );
};

import type { FormInputProps } from '../../shared/types';

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
  const { isTouched, errors } = field.state.meta;
  const resolvedValue = String(field.state.value ?? '');
  const resolvedError =
    error ?? (isTouched && errors.length > 0 ? errors[0] : '');

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        type={inputType}
        value={resolvedValue}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        disabled={disabled}
        className={`w-full border px-3 py-2 rounded-lg text-sm ${
          disabled ? 'bg-gray-100' : 'border-gray-300'
        } ${resolvedError ? 'border-red-500' : ''}`}
      />
      {resolvedError && (
        <p className="text-red-500 text-xs mt-1">{resolvedError}</p>
      )}
    </div>
  );
};

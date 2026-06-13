import type { FormInputProps } from '../../shared/types';

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
  const { isTouched, errors } = field.state.meta;
  const resolvedValue = String(field.state.value ?? '');
  const resolvedError =
    error ?? (isTouched && errors.length > 0 ? errors[0]?.message : '');

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <textarea
        value={resolvedValue}
        onChange={(e) => field.handleChange(e.target.value)}
        onBlur={field.handleBlur}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={`block w-full border px-3 py-2 rounded-lg text-sm ${
          disabled ? 'bg-gray-100' : 'border-gray-300'
        } ${resolvedError ? 'border-red-500' : ''}`}
      />
      {resolvedError && <p className="text-red-500 text-xs">{resolvedError}</p>}
    </div>
  );
};

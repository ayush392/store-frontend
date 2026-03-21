import { useForm } from '@tanstack/react-form';
import { DateInput } from './form/DateInput';
import { NumberInput } from './form/NumberInput';
import { SelectInput } from './form/SelectInput';
import { TextArea } from './form/TextArea';

export const TransactionForm = () => {
  const form = useForm({
    defaultValues: {}
  });

  const { Field } = form;

  return (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field name="type">
          {(field) => (
            <SelectInput
              label="Type"
              field={field}
              options={['CREDIT', 'DEBIT']}
            />
          )}
        </Field>

        <Field name="amount">
          {(field) => <NumberInput label="Amount" field={field} />}
        </Field>
      </div>

      <Field name="date">
        {(field) => (
          <DateInput
            label="Date & Time"
            field={field}
            inputType="datetime-local"
          />
        )}
      </Field>

      <Field name="notes">
        {(field) => (
          <TextArea label="Notes" field={field} rows={3} placeholder="Notes" />
        )}
      </Field>

      <div className="flex space-x-3 pt-4">
        <button
          type="button"
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-60"
        >
          Save
        </button>
      </div>
    </form>
  );
};

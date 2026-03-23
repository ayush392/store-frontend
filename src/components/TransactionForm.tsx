import { Form, Transaction } from '@store/schemas';
import { useForm, useStore } from '@tanstack/react-form';
import { DateInput } from './form/DateInput';
import { NumberInput } from './form/NumberInput';
import { SelectInput } from './form/SelectInput';
import { TextArea } from './form/TextArea';
import { TransactionMessage } from './TransactionMessage';

type Props = {
  name: string;
};

export const TransactionForm = ({ name }: Props) => {
  // const mutation = useMutation({
  //   mutationFn: createTransaction,
  //   onSuccess: (data) => {
  //     console.log('Success:', data);
  //   },
  //   onError: (error) => {
  //     console.error('Error:', error);
  //   },
  // });

  const form = useForm({
    defaultValues: {
      transactionType: Transaction.TransactionTypeEnum.options[1],
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      note: ''
    },
    onSubmit: async ({ value }) => {
      console.log('Submitted values:', value);
    },
    validators: {
      onSubmit: Form.CreateTransactionSchema,
      onBlur: Form.CreateTransactionSchema
    }
  });

  const { Field } = form;
  const amount = useStore(form.store, (state) => state.values.amount);
  const type = useStore(form.store, (state) => state.values.transactionType);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <TransactionMessage amount={amount} type={type} name={name} />
      <div className="grid grid-cols-2 gap-4">
        <Field name="transactionType">
          {(field) => (
            <SelectInput
              label="Type"
              field={field}
              options={Transaction.TransactionTypeEnum.options}
            />
          )}
        </Field>

        <Field name="amount">
          {(field) => <NumberInput label="Amount" field={field} />}
        </Field>
      </div>

      <Field name="date">
        {(field) => <DateInput label="Date" field={field} />}
      </Field>

      <Field name="note">
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

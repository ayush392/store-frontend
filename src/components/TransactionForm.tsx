import { Form, Transaction } from '@store/schemas';
import { useForm, useStore } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '../lib/fetcher';
import { notifyError, notifySuccess } from '../lib/toast';
import { DateInput } from './form/DateInput';
import { NumberInput } from './form/NumberInput';
import { SelectInput } from './form/SelectInput';
import { TextArea } from './form/TextArea';
import { TransactionMessage } from './TransactionMessage';

type Props = {
  name: string;
  accountId: string;
};

export const TransactionForm = ({ name, accountId }: Props) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: Form.CreateTransaction) =>
      fetcher(`/transaction`, 'POST', { ...formData, accountId }),
    onSuccess: () => {
      notifySuccess('Transaction created for ' + name);
      queryClient.invalidateQueries({ queryKey: ['staff', accountId] });
      queryClient.invalidateQueries({ queryKey: ['customer', accountId] });
      queryClient.invalidateQueries({ queryKey: ['store', accountId] });
    },
    onError: (error) => {
      notifyError(error.message);
    }
  });

  const form = useForm({
    defaultValues: {
      transactionType: Transaction.TransactionTypeEnum.options[0]!,
      amount: 0,
      date: new Date().toLocaleDateString('en-CA'),
      note: ''
    },
    onSubmit: ({ value, formApi }) => {
      mutate(value);
      formApi.reset();
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

      <button
        disabled={isPending}
        type="submit"
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-60"
      >
        Save
      </button>
    </form>
  );
};

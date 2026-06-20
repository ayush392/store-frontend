import { useForm, useStore } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '../lib/fetcher';
import { notifyError, notifySuccess } from '../lib/toast';
import { DateInput } from './form/DateInput';
import { NumberInput } from './form/NumberInput';
import { SelectInput } from './form/SelectInput';
import { TextArea } from './form/TextArea';
import { TransactionMessage } from './TransactionMessage';
import {
  type CreateTransaction,
  type UpdateTransaction,
  CreateTransactionSchema,
  TransactionTypeEnum
} from '../shared/schemas/transaction.schema';
import type { Transactions } from '../shared/types';
import z from 'zod';
import { BillImages, type BillFile } from './BillImages';
import { useState } from 'react';
import { cloudinarySignedUpload } from '../shared/utils/cloudinary';

type Props = {
  name: string;
  accountId: string;
  transaction?: Transactions;
};

export const TransactionForm = ({ name, accountId, transaction }: Props) => {
  const [bills, setBills] = useState<BillFile[]>([]);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: CreateTransaction | UpdateTransaction) => {
      if (transaction) {
        return fetcher(`/transaction/${transaction._id}`, 'PATCH', formData);
      }
      return fetcher(`/transaction`, 'POST', { ...formData, accountId });
    },
    onSuccess: () => {
      const message = transaction
        ? 'Transaction updated successfully'
        : 'Transaction created for ' + name;
      notifySuccess(message);
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
      transactionType:
        transaction?.transactionType || TransactionTypeEnum.options[0],
      amount: transaction?.amount || 0,
      date: new Date(transaction?.date || new Date()).toLocaleDateString(
        'en-CA'
      ),
      note: transaction?.note || '',
      ...(transaction ? { reason: '' } : {})
    },
    onSubmit: async ({ value, formApi }) => {
      const defaultValues = formApi.options.defaultValues || {};
      if (transaction) {
        const changedValues: UpdateTransaction = { reason: '' };

        const keys = Object.keys(defaultValues) as Array<
          keyof typeof defaultValues
        >;

        for (const key of keys) {
          if (value[key] !== defaultValues[key]) {
            changedValues[key as keyof UpdateTransaction] = value[key];
          }
        }

        if (Object.keys(changedValues).length === 0) {
          notifyError('Nothing to update');
          return;
        }

        mutate(changedValues);
        return;
      }

      const uploadImages = await Promise.all(
        bills.map((bill) => cloudinarySignedUpload(bill.file, accountId))
      );

      console.log({ uploadImages });

      setBills([]);
      mutate({ ...value, images: uploadImages });
      form.reset();
    },
    validators: {
      onSubmit: transaction
        ? CreateTransactionSchema.extend({
            reason: z.string().trim().min(1, 'Reason is required')
          })
        : CreateTransactionSchema
    }
  });

  const { Field } = form;
  const amount = useStore(form.store, (state) => state.values.amount);
  const type = useStore(form.store, (state) => state.values.transactionType);
  const isValid = useStore(form.store, (state) => state.isValid);
  const isSubmitting = useStore(form.store, (state) => state.isSubmitting);

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
              options={TransactionTypeEnum.options}
              disabled={!!transaction}
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

      <BillImages bills={bills} setBills={setBills} />

      {transaction && (
        <Field name="reason">
          {(field) => (
            <TextArea
              label="Reason for update"
              field={field}
              rows={2}
              placeholder="Why are you updating this?"
            />
          )}
        </Field>
      )}

      <button
        disabled={isPending || isSubmitting || !isValid}
        type="submit"
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-60 active:bg-green-700"
      >
        {transaction
          ? isPending || isSubmitting
            ? 'Updating...'
            : 'Update'
          : isPending || isSubmitting
            ? 'Saving...'
            : 'Save'}
      </button>
    </form>
  );
};

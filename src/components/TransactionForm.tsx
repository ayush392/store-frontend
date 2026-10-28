import { useForm, useStore } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
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
import { UploadBills, type BillFile } from './UploadBills';
import { useState } from 'react';
import { cloudinarySignedUpload } from '../shared/utils/cloudinary';
import { haptics } from '../shared/utils/haptics';

type Props = {
  name: string;
  accountId: string;
  transaction?: Transactions;
};

export const TransactionForm = ({ name, accountId, transaction }: Props) => {
  const [bills, setBills] = useState<BillFile[]>([]);
  const queryClient = useQueryClient();
  const router = useRouter();

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
      haptics.success();
      // Detail screens, lists (due amounts) and home (recent + chart) all change
      for (const key of ['staff', 'customer', 'store']) {
        queryClient.invalidateQueries({ queryKey: [key, accountId] });
      }
      for (const key of ['staffs', 'customers', 'stores', 'recent', 'graph']) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
      if (transaction) {
        queryClient.invalidateQueries({ queryKey: ['transaction', transaction._id] });
      }

      // Pop back to the account screen, like a native form sheet
      if (router.history.canGoBack()) router.history.back();
      else router.navigate({ to: '/', replace: true });
    },
    onError: (error) => {
      notifyError(error.message);
      haptics.error();
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
      noValidate
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
          {(field) => <NumberInput label="Amount" field={field} prefix="₹" />}
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

      <UploadBills bills={bills} setBills={setBills} />

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
        onClick={() => haptics.medium()}
        className="btn btn-lg btn-primary mt-2"
      >
        {transaction
          ? isPending || isSubmitting
            ? 'Updating…'
            : 'Update Transaction'
          : isPending || isSubmitting
            ? 'Saving…'
            : 'Save Transaction'}
      </button>
    </form>
  );
};

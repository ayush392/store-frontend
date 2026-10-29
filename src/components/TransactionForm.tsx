import { useForm, useStore } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  TransactionTypeEnum,
  getTransactionTypeOptions
} from '../shared/schemas/transaction.schema';
import type { AccountType } from '../shared/schemas/account.schema';
import type { Transactions, UserDetails } from '../shared/types';
import z from 'zod';
import { UploadBills, type BillFile } from './UploadBills';
import { useState } from 'react';
import { cloudinarySignedUpload } from '../shared/utils/cloudinary';
import { queryKeys, transactionAffectedKeys } from '../shared/queryKeys';
import { getChangedFields } from '../shared/changedFields';
import { TransactionImageViewer } from './TransactionImageViewer';

type Props = {
  name: string;
  accountId: string;
  accountType: AccountType;
  transaction?: Transactions;
};

export const TransactionForm = ({
  name,
  accountId,
  accountType,
  transaction
}: Props) => {
  const [bills, setBills] = useState<BillFile[]>([]);
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
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
      for (const queryKey of transactionAffectedKeys(accountType, accountId)) {
        queryClient.invalidateQueries({ queryKey });
      }
      if (transaction) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.transactionBasic(transaction._id)
        });
      }
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
        // `reason` is required for every edit, so it doesn't count as a change.
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { reason: _reason, ...changedValues } = getChangedFields(
          value,
          defaultValues
        );

        if (Object.keys(changedValues).length === 0) {
          notifyError('Nothing to update');
          return;
        }

        try {
          await mutateAsync({
            ...changedValues,
            reason: value.reason ?? ''
          } as UpdateTransaction);
        } catch {
          // The error toast is shown by onError; keep the entered values.
        }
        return;
      }

      let uploadImages: Awaited<ReturnType<typeof cloudinarySignedUpload>>[];
      try {
        uploadImages = await Promise.all(
          bills.map((bill) => cloudinarySignedUpload(bill.file, accountId))
        );
      } catch {
        notifyError('Bill upload failed. Your entries are kept, please retry.');
        return;
      }

      try {
        await mutateAsync({ ...value, images: uploadImages });
      } catch {
        // The error toast is shown by onError; keep the entered values.
        return;
      }

      // Clear the form and bills only after the transaction was saved.
      setBills([]);
      formApi.reset();
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
        if (form.state.isSubmitting || isPending) return; // no double submit
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
              // Edit mode: type is fixed, so show the full list for display.
              options={
                transaction
                  ? TransactionTypeEnum.options
                  : getTransactionTypeOptions(accountType)
              }
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

      {transaction ? (
        <ExistingBills
          accountId={accountId}
          accountType={accountType}
          transactionId={transaction._id}
        />
      ) : (
        <UploadBills bills={bills} setBills={setBills} />
      )}

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

type ExistingBillsProps = {
  accountId: string;
  accountType: AccountType;
  transactionId: string;
};

// Read-only view of the bills already attached to a transaction. Editing never
// sends `images`, so existing bills are always kept on the server. Thumbnails
// are shown only from freshly fetched data that matches this transaction.
function ExistingBills({
  accountId,
  accountType,
  transactionId
}: ExistingBillsProps) {
  const { data, isSuccess, isFetching } = useQuery({
    queryKey: queryKeys.accountDetail(accountType, accountId),
    queryFn: () => fetcher<UserDetails>(`/account/${accountId}/`),
    refetchOnMount: 'always'
  });

  const match =
    isSuccess && !isFetching
      ? data.transactions.find(
          (t) => t._id === transactionId && t.accountId === accountId
        )
      : undefined;

  let content;
  if (isFetching) {
    content = <p className="text-sm text-gray-500">Loading bills...</p>;
  } else if (!match) {
    content = <p className="text-sm text-gray-500">Existing bills are kept.</p>;
  } else if (!match.images?.length) {
    content = <p className="text-sm text-gray-500">No bills attached.</p>;
  } else {
    content = <TransactionImageViewer transaction={match} />;
  }

  return (
    <div className="space-y-1">
      <div className="block text-sm font-medium text-gray-700">
        Bills / Receipts
      </div>
      {content}
      <p className="text-xs text-gray-500">
        Bills can't be changed when editing a transaction.
      </p>
    </div>
  );
}

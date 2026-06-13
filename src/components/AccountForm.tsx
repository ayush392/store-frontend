import { useForm, useStore } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '../lib/fetcher';
import { notifyError, notifySuccess } from '../lib/toast';
import { formatEnum } from '../shared/format';
import { getAccountFormConfig } from '../shared/utils/accountFormConfig';
import { DateInput } from './form/DateInput';
import { NumberInput } from './form/NumberInput';
import { SelectInput } from './form/SelectInput';
import { TextArea } from './form/TextArea';
import { TextInput } from './form/TextInput';
import type {
  AccountType,
  CreateAccount
} from '../shared/schemas/account.schema';
import type { Account } from '../shared/types';

type Props = {
  mode: 'create' | 'edit';
  accountType: AccountType;
  account?: Account;
};

export const AccountForm = ({ mode, accountType, account }: Props) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: unknown) => {
      if (mode === 'edit') {
        return fetcher(`/account/${account?._id}`, 'PATCH', formData);
      } else {
        return fetcher(
          accountType === 'STAFF' ? '/staff' : '/account',
          'POST',
          formData
        );
      }
    },
    onSuccess: () => {
      const accType = formatEnum(accountType);
      const message =
        mode === 'edit'
          ? 'Profile updated successfully'
          : `New ${accType} created`;
      notifySuccess(message);
      queryClient.invalidateQueries({ queryKey: [accType] });
    },
    onError: (error) => {
      notifyError(error.message);
    }
  });

  const config = getAccountFormConfig(accountType, mode, account);
  const form = useForm({
    defaultValues: config.defaultValues,
    validators: {
      onSubmit: config.schema
    },
    onSubmit: ({ value, formApi }) => {
      const defaultValues = formApi.options.defaultValues || {};

      if (mode === 'edit') {
        const changedValues: Partial<CreateAccount> = {};
        const keys = Object.keys(defaultValues) as Array<
          keyof typeof defaultValues
        >;
        for (const key of keys) {
          if (value[key] !== defaultValues[key]) {
            changedValues[key as keyof CreateAccount] = value[key];
          }
        }

        if (Object.keys(changedValues).length === 0) {
          notifyError('Nothing to update');
          return;
        }

        mutate(changedValues);
        return;
      }
      mutate(value);
      formApi.reset();
    }
  });

  const { Field } = form;
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
      <Field name="name">
        {(field) => (
          <TextInput label="Name" field={field} placeholder="Enter name" />
        )}
      </Field>

      <Field name="displayName">
        {(field) => (
          <TextInput
            label="Display Name"
            field={field}
            placeholder="Display name"
          />
        )}
      </Field>

      <Field name="phone">
        {(field) => (
          <TextInput
            label="Phone Number"
            field={field}
            placeholder="Phone Number"
          />
        )}
      </Field>

      {/* staff fields in create mode only */}
      {accountType === 'STAFF' && mode === 'create' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Field name="employment.salaryType">
              {(field) => (
                <SelectInput
                  label="Salary Type"
                  field={field}
                  options={['DAILY', 'MONTHLY']}
                />
              )}
            </Field>

            <Field name="employment.salary">
              {(field) => <NumberInput label="Salary" field={field} />}
            </Field>
          </div>

          <Field name="employment.joinDate">
            {(field) => <DateInput label="Join Date" field={field} />}
          </Field>
        </>
      )}

      <Field name="address">
        {(field) => (
          <TextArea
            label="Address"
            field={field}
            rows={2}
            placeholder="Address"
          />
        )}
      </Field>

      <Field name="notes">
        {(field) => (
          <TextInput label="Notes" field={field} placeholder="Notes..." />
        )}
      </Field>

      <button
        disabled={isPending || isSubmitting || !isValid}
        type="submit"
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-60"
      >
        {mode === 'edit'
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

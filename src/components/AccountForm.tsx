import { useForm } from '@tanstack/react-form';
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
import type { AccountType } from '../shared/schemas/account.schema';

type Props = {
  accountType: AccountType;
};

export const AccountForm = ({ accountType }: Props) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: typeof config.defaultValues) =>
      fetcher(
        accountType === 'STAFF' ? '/staff' : '/account',
        'POST',
        formData
      ),
    onSuccess: () => {
      const accType = formatEnum(accountType);
      notifySuccess(`New ${accType} created`);
      queryClient.invalidateQueries({ queryKey: [accType] });
    },
    onError: (error) => {
      notifyError(error.message);
    }
  });

  const config = getAccountFormConfig(accountType);
  const form = useForm({
    defaultValues: config.defaultValues,
    validators: {
      onSubmit: config.schema,
      onBlur: config.schema
    },
    onSubmit: ({ value, formApi }) => {
      mutate(value);
      formApi.reset();
    }
  });

  const { Field } = form;
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

      {/* staff fields */}
      {accountType === 'STAFF' && (
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
        disabled={isPending}
        type="submit"
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium disabled:opacity-60"
      >
        Save
      </button>
    </form>
  );
};

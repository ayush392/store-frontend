import { useForm, useStore } from '@tanstack/react-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { fetcher } from '../lib/fetcher';
import { notifyError, notifySuccess } from '../lib/toast';
import { formatEnum } from '../shared/format';
import { getAccountFormConfig } from '../shared/utils/accountFormConfig';
import { DateInput } from './form/DateInput';
import { NumberInput } from './form/NumberInput';
import { SelectInput } from './form/SelectInput';
import { TextArea } from './form/TextArea';
import { TextInput } from './form/TextInput';
import { haptics } from '../shared/utils/haptics';
import { MdOutlineContactPhone } from 'react-icons/md';
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

// Contact Picker API is Android Chrome only; hide the button elsewhere (e.g. iOS)
const hasContactPicker =
  typeof navigator !== 'undefined' &&
  'contacts' in navigator &&
  'ContactsManager' in window &&
  typeof (
    navigator as unknown as {
      contacts?: { select?: (...args: unknown[]) => unknown };
    }
  ).contacts?.select === 'function';

const listPath: Record<AccountType, 'staffs' | 'customers' | 'stores'> = {
  STAFF: 'staffs',
  CUSTOMER: 'customers',
  STORE: 'stores'
};

export const AccountForm = ({ mode, accountType, account }: Props) => {
  const queryClient = useQueryClient();
  const router = useRouter();

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
      haptics.success();
      queryClient.invalidateQueries({ queryKey: [listPath[accountType]] });
      if (account?._id) {
        queryClient.invalidateQueries({ queryKey: [accountType.toLowerCase(), account._id] });
        queryClient.invalidateQueries({ queryKey: ['account', account._id] });
      }
      queryClient.invalidateQueries({ queryKey: ['recent'] });

      // Pop back to where the user came from, like a native form sheet
      if (router.history.canGoBack()) router.history.back();
      else router.navigate({ to: `/${listPath[accountType]}`, replace: true });
    },
    onError: (error) => {
      notifyError(error.message);
      haptics.error();
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

  const handlePickContact = async (field?: {
    handleChange: (val: string) => void;
  }) => {
    haptics.selection();

    if (!hasContactPicker) {
      notifyError(
        'Contact Picker is not supported on this browser/device. Please type the mobile number manually.'
      );
      return;
    }

    try {
      const navContacts = (
        navigator as unknown as {
          contacts: {
            select: (
              properties: string[],
              options?: { multiple?: boolean }
            ) => Promise<Array<{ name?: string[]; tel?: string[] }>>;
          };
        }
      ).contacts;

      const contacts = await navContacts.select(['name', 'tel'], {
        multiple: false
      });

      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        const rawPhone = contact.tel?.[0];

        if (rawPhone) {
          // Normalize and clean phone number
          let cleaned = rawPhone.replace(/\D/g, '');
          if (cleaned.length === 12 && cleaned.startsWith('91')) {
            cleaned = cleaned.slice(2);
          } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
            cleaned = cleaned.slice(1);
          } else if (cleaned.length > 10) {
            cleaned = cleaned.slice(-10);
          }

          if (field) {
            field.handleChange(cleaned);
          } else {
            form.setFieldValue('phone', cleaned as never);
          }
        }

        // Auto-fill name if contact has name and form name is currently empty
        const contactName = contact.name?.[0];
        if (contactName) {
          const currentName = form.getFieldValue('name');
          if (!currentName || String(currentName).trim() === '') {
            form.setFieldValue('name', contactName as never);
          }
        }

        haptics.success();
        notifySuccess('Contact loaded from phone');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User cancelled contact picker dialog
        return;
      }
      console.error('Contact picker error:', err);
      notifyError('Failed to access contacts');
    }
  };

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <Field name="name">
        {(field) => (
          <TextInput label="Name" field={field} placeholder="Enter name" autoComplete="name" />
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
            placeholder="10-digit mobile number"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            headerAction={
              hasContactPicker && (
              <button
                type="button"
                onClick={() => handlePickContact(field)}
                className="btn btn-sm btn-tinted h-7"
                aria-label="Choose from phone contacts"
              >
                <MdOutlineContactPhone size={14} />
                Contacts
              </button>
              )
            }
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
              {(field) => <NumberInput label="Salary" field={field} prefix="₹" />}
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
        onClick={() => haptics.medium()}
        className="btn btn-lg btn-primary mt-2"
      >
        {mode === 'edit'
          ? isPending || isSubmitting
            ? 'Updating…'
            : 'Update Profile'
          : isPending || isSubmitting
            ? 'Saving…'
            : 'Save Profile'}
      </button>
    </form>
  );
};

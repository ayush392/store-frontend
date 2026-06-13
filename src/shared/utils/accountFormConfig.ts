import {
  CreateAccountSchema,
  UpdateAccountSchema,
  type AccountType
} from '../schemas/account.schema';
import { CreateStaffSchema, SalaryTypeEnum } from '../schemas/staff.schema';
import type { Account } from '../types';

export const getAccountFormConfig = (
  accountType: AccountType,
  mode: 'create' | 'edit',
  account?: Account
) => {
  const defaultData = {
    name: account?.name || '',
    displayName: account?.displayName || '',
    phone: account?.phone || '',
    address: account?.address || '',
    notes: account?.notes || ''
  };

  const employment = {
    salaryType: SalaryTypeEnum.options[0] || 'MONTHLY',
    joinDate: new Date().toLocaleDateString('en-CA'),
    salary: 0
  };

  if (accountType === 'STAFF' && mode === 'create') {
    return {
      defaultValues: {
        ...defaultData,
        employment: { ...employment }
      },
      schema: CreateStaffSchema
    };
  }

  if (mode === 'edit') {
    return {
      defaultValues: { ...defaultData },
      schema: UpdateAccountSchema
    };
  }

  return {
    defaultValues: { ...defaultData, accountType },
    schema: CreateAccountSchema
  };
};

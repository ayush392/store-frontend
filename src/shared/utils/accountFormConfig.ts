import {
  CreateAccountSchema,
  type AccountType
} from '../schemas/account.schema';
import { CreateStaffSchema, SalaryTypeEnum } from '../schemas/staff.schema';

export const getAccountFormConfig = (accountType: AccountType) => {
  const defaultData = {
    name: '',
    displayName: '',
    phone: '',
    address: '',
    notes: ''
  };
  const employment = {
    salaryType: SalaryTypeEnum.options[0] || 'MONTHLY',
    joinDate: new Date().toLocaleDateString('en-CA'),
    salary: 0
  };

  if (accountType === 'STAFF') {
    return {
      defaultValues: {
        ...defaultData,
        employment: { ...employment }
      },
      schema: CreateStaffSchema
    };
  }

  return {
    defaultValues: { ...defaultData, accountType },
    schema: CreateAccountSchema
  };
};

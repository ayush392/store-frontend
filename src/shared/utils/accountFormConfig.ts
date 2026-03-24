import { Form, Staff, type AccountType } from '@store/schemas';

export const getAccountFormConfig = (accountType: AccountType) => {
  const defaultData = {
    name: '',
    displayName: '',
    phone: '',
    address: '',
    notes: ''
  };
  const employment = {
    salaryType: Staff.SalaryTypeEnum.options[0] || 'MONTHLY',
    joinDate: new Date().toLocaleDateString('en-CA'),
    salary: 0
  };

  if (accountType === 'STAFF') {
    return {
      defaultValues: {
        ...defaultData,
        employment: { ...employment }
      },
      schema: Form.CreateStaffSchema
    };
  }

  return {
    defaultValues: { ...defaultData, accountType },
    schema: Form.CreateAccountSchema
  };
};

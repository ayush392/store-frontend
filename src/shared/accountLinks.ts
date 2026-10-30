import type { AccountType } from './schemas/account.schema';

// Typed router links for an account, by account type. Use these instead of
// building '/customers/...' style paths by hand.

export const accountListLink = (type: AccountType) => {
  switch (type) {
    case 'CUSTOMER':
      return { to: '/customers' } as const;
    case 'STORE':
      return { to: '/stores' } as const;
    case 'STAFF':
      return { to: '/staffs' } as const;
  }
};

export const accountDetailLink = (type: AccountType, accountId: string) => {
  switch (type) {
    case 'CUSTOMER':
      return {
        to: '/customers/$customerId',
        params: { customerId: accountId }
      } as const;
    case 'STORE':
      return { to: '/stores/$storeId', params: { storeId: accountId } } as const;
    case 'STAFF':
      return { to: '/staffs/$staffId', params: { staffId: accountId } } as const;
  }
};

export const accountEditLink = (type: AccountType, accountId: string) => {
  switch (type) {
    case 'CUSTOMER':
      return {
        to: '/customers/$customerId/edit',
        params: { customerId: accountId }
      } as const;
    case 'STORE':
      return {
        to: '/stores/$storeId/edit',
        params: { storeId: accountId }
      } as const;
    case 'STAFF':
      return {
        to: '/staffs/$staffId/edit',
        params: { staffId: accountId }
      } as const;
  }
};

export const newTransactionLink = (type: AccountType, accountId: string) => {
  switch (type) {
    case 'CUSTOMER':
      return {
        to: '/customers/$customerId/transactions/new',
        params: { customerId: accountId }
      } as const;
    case 'STORE':
      return {
        to: '/stores/$storeId/transactions/new',
        params: { storeId: accountId }
      } as const;
    case 'STAFF':
      return {
        to: '/staffs/$staffId/transactions/new',
        params: { staffId: accountId }
      } as const;
  }
};

export const editTransactionLink = (
  type: AccountType,
  accountId: string,
  txId: string
) => {
  switch (type) {
    case 'CUSTOMER':
      return {
        to: '/customers/$customerId/transactions/$txId/edit',
        params: { customerId: accountId, txId }
      } as const;
    case 'STORE':
      return {
        to: '/stores/$storeId/transactions/$txId/edit',
        params: { storeId: accountId, txId }
      } as const;
    case 'STAFF':
      return {
        to: '/staffs/$staffId/transactions/$txId/edit',
        params: { staffId: accountId, txId }
      } as const;
  }
};

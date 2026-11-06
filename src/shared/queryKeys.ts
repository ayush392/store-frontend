import type { AccountType } from './schemas/account.schema';

// Values match the keys already used across the app, so existing cache
// behaviour is unchanged. Use these helpers instead of inline arrays.
const listKeyByType = {
  CUSTOMER: 'customers',
  STORE: 'stores',
  STAFF: 'staffs'
} as const;

const detailKeyByType = {
  CUSTOMER: 'customer',
  STORE: 'store',
  STAFF: 'staff'
} as const;

export const queryKeys = {
  accountList: (type: AccountType) => [listKeyByType[type]] as const,
  accountDetail: (type: AccountType, accountId: string) =>
    [detailKeyByType[type], accountId] as const,
  accountBasic: (accountId: string | undefined) =>
    ['account', accountId, 'basic'] as const,
  transactionBasic: (transactionId: string | undefined) =>
    ['transaction', transactionId, 'basic'] as const,
  recent: () => ['recent'] as const,
  graph: () => ['graph'] as const,
  calendar: (accountId: string, month: number, year: number) =>
    ['calendar', accountId, month, year] as const,
  // Prefix of every calendar query (all staff, all months).
  allCalendars: () => ['calendar'] as const,
  // Prefix of one staff member's calendar queries (all months).
  staffCalendars: (accountId: string) => ['calendar', accountId] as const,
  me: () => ['me'] as const
};

// Queries whose data changes when a transaction on this account is
// created, edited or deleted (balances, lists, recent, chart).
export const transactionAffectedKeys = (
  accountType: AccountType,
  accountId: string
) => [
  queryKeys.accountDetail(accountType, accountId),
  queryKeys.accountBasic(accountId),
  queryKeys.accountList(accountType),
  queryKeys.recent(),
  queryKeys.graph()
];

// Queries whose data changes when an account profile is created or edited.
export const accountAffectedKeys = (
  accountType: AccountType,
  accountId?: string
) =>
  accountId
    ? [
        queryKeys.accountList(accountType),
        queryKeys.accountDetail(accountType, accountId),
        queryKeys.accountBasic(accountId),
        queryKeys.recent()
      ]
    : [queryKeys.accountList(accountType)];

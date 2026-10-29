import { describe, expect, it } from 'vitest';
import {
  accountAffectedKeys,
  queryKeys,
  transactionAffectedKeys
} from './queryKeys';

describe('queryKeys', () => {
  it('keeps the existing list and detail key values', () => {
    expect(queryKeys.accountList('CUSTOMER')).toEqual(['customers']);
    expect(queryKeys.accountList('STORE')).toEqual(['stores']);
    expect(queryKeys.accountList('STAFF')).toEqual(['staffs']);
    expect(queryKeys.accountDetail('CUSTOMER', 'a1')).toEqual(['customer', 'a1']);
    expect(queryKeys.accountDetail('STORE', 'a1')).toEqual(['store', 'a1']);
    expect(queryKeys.accountDetail('STAFF', 'a1')).toEqual(['staff', 'a1']);
  });

  // Regression: AccountPage used `queryKey: []` for every account, so editing
  // account B could show (and save over) the cached data of account A.
  it('gives different accounts different basic-profile keys', () => {
    expect(queryKeys.accountBasic('a')).not.toEqual(queryKeys.accountBasic('b'));
    expect(queryKeys.accountBasic('a')).toEqual(['account', 'a', 'basic']);
  });

  it('gives different transactions different basic keys', () => {
    expect(queryKeys.transactionBasic('t1')).not.toEqual(
      queryKeys.transactionBasic('t2')
    );
  });

  it('includes month and year in calendar keys', () => {
    expect(queryKeys.calendar('a', 3, 2026)).not.toEqual(
      queryKeys.calendar('a', 4, 2026)
    );
  });
});

describe('transactionAffectedKeys', () => {
  it('covers detail, basic, list, recent and graph', () => {
    expect(transactionAffectedKeys('CUSTOMER', 'a1')).toEqual([
      ['customer', 'a1'],
      ['account', 'a1', 'basic'],
      ['customers'],
      ['recent'],
      ['graph']
    ]);
  });
});

// Regression: AccountForm invalidated ['Customer'] while the list used
// ['customers'], so new accounts never appeared in the list.
describe('accountAffectedKeys', () => {
  it('refreshes the list that the list screen actually uses', () => {
    expect(accountAffectedKeys('CUSTOMER')).toEqual([['customers']]);
    expect(accountAffectedKeys('STORE')).toEqual([['stores']]);
    expect(accountAffectedKeys('STAFF')).toEqual([['staffs']]);
  });

  it('also refreshes detail and basic data when editing an account', () => {
    expect(accountAffectedKeys('STORE', 's1')).toEqual([
      ['stores'],
      ['store', 's1'],
      ['account', 's1', 'basic'],
      ['recent']
    ]);
  });
});

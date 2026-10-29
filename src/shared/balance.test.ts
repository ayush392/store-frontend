import { describe, expect, it } from 'vitest';
import { getBalanceDisplay } from './balance';

describe('getBalanceDisplay: customers and stores', () => {
  it.each(['CUSTOMER', 'STORE'] as const)(
    '%s with a positive balance is "To collect"',
    (type) => {
      expect(getBalanceDisplay(type, 1500)).toEqual({
        label: 'To collect',
        amount: '₹1,500',
        className: 'text-outstanding'
      });
    }
  );

  it.each(['CUSTOMER', 'STORE'] as const)(
    '%s with a negative balance is "Advance received", shown without a minus sign',
    (type) => {
      expect(getBalanceDisplay(type, -250)).toEqual({
        label: 'Advance received',
        amount: '₹250',
        className: 'text-credit'
      });
    }
  );

  it.each(['CUSTOMER', 'STORE'] as const)(
    '%s with a zero balance is "Settled"',
    (type) => {
      expect(getBalanceDisplay(type, 0)).toEqual({
        label: 'Settled',
        amount: '₹0',
        className: 'text-fg-muted'
      });
    }
  );
});

describe('getBalanceDisplay: staff', () => {
  // Staff labels are pending confirmation, so the existing behaviour is kept.
  it('keeps the "Outstanding" label and the signed amount', () => {
    expect(getBalanceDisplay('STAFF', 8416)).toEqual({
      label: 'Outstanding',
      amount: '₹8,416',
      className: 'text-outstanding'
    });
    expect(getBalanceDisplay('STAFF', -3680).amount).toBe('₹-3,680');
    expect(getBalanceDisplay('STAFF', 0).label).toBe('Outstanding');
  });
});

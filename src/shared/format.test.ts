import { describe, expect, it } from 'vitest';
import {
  formatAmount,
  formatEnum,
  getAmountColor,
  getAmountSymbol
} from './format';

describe('formatAmount', () => {
  it('formats zero', () => {
    expect(formatAmount(0)).toBe('₹0');
  });

  it('uses Indian digit grouping', () => {
    expect(formatAmount(1234567)).toBe('₹12,34,567');
  });

  it('drops the decimal part', () => {
    expect(formatAmount(1234.56)).toBe('₹1,234');
  });

  it('keeps the sign of negative amounts', () => {
    expect(formatAmount(-500)).toBe('₹-500');
  });
});

describe('getAmountSymbol', () => {
  // amountChange > 0 raises the outstanding balance (UDHAAR, ADVANCE).
  it('shows "-" for transactions that raise the balance', () => {
    expect(getAmountSymbol(500)).toBe('-');
  });

  // amountChange < 0 lowers the outstanding balance (PAYMENT).
  it('shows "+" for transactions that lower the balance', () => {
    expect(getAmountSymbol(-500)).toBe('+');
  });

  it('shows nothing when the balance does not change (SALARY)', () => {
    expect(getAmountSymbol(0)).toBe('');
  });
});

describe('getAmountColor', () => {
  it('marks UDHAAR and ADVANCE as debit', () => {
    expect(getAmountColor('UDHAAR')).toBe('text-red-500');
    expect(getAmountColor('ADVANCE')).toBe('text-red-500');
  });

  it('marks PAYMENT differently from debits', () => {
    expect(getAmountColor('PAYMENT')).toBe('text-blue-600');
  });

  it('uses a neutral color for SALARY', () => {
    expect(getAmountColor('SALARY')).toBe('text-gray-600');
  });
});

describe('formatEnum', () => {
  it('capitalizes the first letter only', () => {
    expect(formatEnum('CUSTOMER')).toBe('Customer');
  });

  it('returns an empty string for empty input', () => {
    expect(formatEnum('')).toBe('');
  });
});

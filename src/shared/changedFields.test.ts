import { describe, expect, it } from 'vitest';
import { getChangedFields } from './changedFields';

describe('getChangedFields', () => {
  it('returns only the fields that differ from the defaults', () => {
    expect(
      getChangedFields({ name: 'Ravi', phone: '9876543210' }, {
        name: 'Ravi',
        phone: '9000000000'
      })
    ).toEqual({ phone: '9876543210' });
  });

  it('returns an empty object when nothing changed', () => {
    expect(getChangedFields({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toEqual({});
  });

  it('only compares keys present in the defaults', () => {
    expect(getChangedFields({ a: 2, extra: 1 }, { a: 1 })).toEqual({ a: 2 });
  });

  // Regression: `reason` always differs from its default in edit mode, which
  // made the "Nothing to update" check impossible to trigger. The form now
  // strips `reason` before checking for real changes.
  it('lets callers ignore `reason` when checking for real changes', () => {
    const { reason, ...changes } = getChangedFields(
      { amount: 500, note: 'n', reason: 'typo' },
      { amount: 500, note: 'n', reason: '' }
    );

    expect(reason).toBe('typo');
    expect(Object.keys(changes)).toHaveLength(0);
  });
});

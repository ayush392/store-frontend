import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contactFieldUpdates,
  describeContactResult,
  getContactsManager,
  normalizePhone,
  pickContact,
  type ContactInfo,
  type ContactsManagerLike
} from './contactPicker';

// A fake navigator.contacts; no real device contacts are used.
const fakeManager = (
  impl: () => Promise<ContactInfo[]>
): ContactsManagerLike & { select: ReturnType<typeof vi.fn> } => ({
  select: vi.fn(impl)
});

// A browser-like window: secure, top-level by default.
const stubBrowser = ({
  contacts,
  secure = true,
  framed = false
}: {
  contacts?: unknown;
  secure?: boolean;
  framed?: boolean;
}) => {
  const win: { isSecureContext: boolean; top?: unknown; self?: unknown } = {
    isSecureContext: secure
  };
  win.self = win;
  win.top = framed ? {} : win;
  vi.stubGlobal('window', win);
  vi.stubGlobal('navigator', contacts === undefined ? {} : { contacts });
};

// The form's current values, merged the same way AccountForm applies them.
const existing = { name: 'Typed name', phone: '9123456789' };
const apply = (updates: ReturnType<typeof contactFieldUpdates>) => ({
  ...existing,
  ...updates
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getContactsManager (feature detection)', () => {
  it('returns the manager when the API is available', () => {
    const manager = fakeManager(async () => []);
    stubBrowser({ contacts: manager });
    expect(getContactsManager()).toBe(manager);
  });

  it('returns null when the API is unavailable', () => {
    stubBrowser({});
    expect(getContactsManager()).toBeNull();
  });

  it('returns null when contacts has no select function', () => {
    stubBrowser({ contacts: { getProperties: () => [] } });
    expect(getContactsManager()).toBeNull();
  });

  it('returns null on a non-secure page or inside a frame', () => {
    const manager = fakeManager(async () => []);
    stubBrowser({ contacts: manager, secure: false });
    expect(getContactsManager()).toBeNull();
    stubBrowser({ contacts: manager, framed: true });
    expect(getContactsManager()).toBeNull();
  });

  it('does not open the picker', () => {
    const manager = fakeManager(async () => []);
    stubBrowser({ contacts: manager });
    getContactsManager();
    expect(manager.select).not.toHaveBeenCalled();
  });
});

describe('pickContact', () => {
  it('asks only for name and tel, one contact', async () => {
    const manager = fakeManager(async () => []);
    await pickContact(manager);
    expect(manager.select).toHaveBeenCalledWith(['name', 'tel'], {
      multiple: false
    });
  });

  it('fills name and phone when a contact is selected', async () => {
    const manager = fakeManager(async () => [
      { name: ['Ravi Kumar'], tel: ['9876501234'] }
    ]);
    const result = await pickContact(manager);
    expect(result).toEqual({
      status: 'picked',
      name: 'Ravi Kumar',
      phone: '9876501234',
      phoneIsValid: true
    });
    expect(apply(contactFieldUpdates(result))).toEqual({
      name: 'Ravi Kumar',
      phone: '9876501234'
    });
  });

  it('does nothing when the user cancels', async () => {
    const result = await pickContact(fakeManager(async () => []));
    expect(result).toEqual({ status: 'cancelled' });
    expect(contactFieldUpdates(result)).toEqual({});
    expect(describeContactResult(result)).toBeNull();
    expect(apply(contactFieldUpdates(result))).toEqual(existing);
  });

  it('handles an API error and keeps the form values', async () => {
    const manager = fakeManager(async () => {
      throw new DOMException('Picker already open', 'InvalidStateError');
    });
    const result = await pickContact(manager);
    expect(result).toEqual({ status: 'error' });
    expect(apply(contactFieldUpdates(result))).toEqual(existing);
  });

  it('keeps the typed name when the contact has no name', async () => {
    const result = await pickContact(
      fakeManager(async () => [{ name: [], tel: ['9876501234'] }])
    );
    expect(contactFieldUpdates(result)).toEqual({ phone: '9876501234' });
    expect(apply(contactFieldUpdates(result))).toEqual({
      name: 'Typed name',
      phone: '9876501234'
    });
    expect(describeContactResult(result)).toBe(
      'Phone filled. That contact has no name.'
    );
  });

  it('keeps the typed phone when the contact has no phone number', async () => {
    const result = await pickContact(
      fakeManager(async () => [{ name: ['Ravi Kumar'] }])
    );
    expect(contactFieldUpdates(result)).toEqual({ name: 'Ravi Kumar' });
    expect(apply(contactFieldUpdates(result))).toEqual({
      name: 'Ravi Kumar',
      phone: '9123456789'
    });
    expect(describeContactResult(result)).toBe(
      'Name filled. That contact has no phone number.'
    );
  });

  it('uses the first valid number when several are returned', async () => {
    const result = await pickContact(
      fakeManager(async () => [
        {
          name: ['  ', 'Ravi Kumar'],
          tel: ['', '022 2345 6789', '+91 98765-01234', '9123400000']
        }
      ])
    );
    expect(result).toEqual({
      status: 'picked',
      name: 'Ravi Kumar',
      phone: '9876501234',
      phoneIsValid: true
    });
  });

  it('keeps the first non-empty number as-is when none is valid', async () => {
    const result = await pickContact(
      fakeManager(async () => [{ name: ['Ravi'], tel: [' ', '+1 555 0100'] }])
    );
    expect(result).toMatchObject({ phone: '+1 555 0100', phoneIsValid: false });
    expect(describeContactResult(result)).toContain('please correct it');
  });

  it('preserves existing values when the contact has no usable data', async () => {
    const result = await pickContact(
      fakeManager(async () => [{ name: ['', '  '], tel: [' '] }])
    );
    expect(result).toEqual({ status: 'empty' });
    expect(contactFieldUpdates(result)).toEqual({});
    expect(apply(contactFieldUpdates(result))).toEqual(existing);
    expect(describeContactResult(result)).toBe(
      'That contact has no name or phone number.'
    );
  });

  it('ignores malformed fields from the browser', async () => {
    const malformed = [{ name: 'not an array', tel: [42] }] as unknown as
      ContactInfo[];
    const result = await pickContact(fakeManager(async () => malformed));
    expect(result).toEqual({ status: 'empty' });
  });
});

describe('normalizePhone', () => {
  it.each([
    ['9876543210', '9876543210'],
    ['+91 98765 43210', '9876543210'],
    ['+91-98765-43210', '9876543210'],
    ['919876543210', '9876543210'],
    ['098765 43210', '9876543210'],
    ['(98765) 43210', '9876543210']
  ])('normalizes %s', (raw, expected) => {
    expect(normalizePhone(raw)).toBe(expected);
  });

  it.each(['12345', '5876543210', '022 2345 6789', '+1 555 0100', ''])(
    'returns null for %s',
    (raw) => {
      expect(normalizePhone(raw)).toBeNull();
    }
  );
});
